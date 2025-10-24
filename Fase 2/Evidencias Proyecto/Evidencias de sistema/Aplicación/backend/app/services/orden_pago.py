from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.models import OrdenPago, Usuario, Club
from app.models.orden_pago import TipoPagoEnum
from app.models.orden_pago import TipoMovimientoEnum, EstadoOrdenEnum
from app.schemas import (
    OrdenPagoCreate,
    OrdenPagoRead,
    IngresosMes,
    EgresosMes,
    OrdenPagoPay,
)
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, Depends, status

from app.utils.decorators import handle_db_exceptions
from app.security import get_current_user
from datetime import datetime, timedelta, timezone
from calendar import monthrange


@handle_db_exceptions
def get_orden_pago(
    db: Session, id_orden: str, current_user: Usuario = Depends(get_current_user)
) -> OrdenPago | None:
    return db.query(OrdenPago).filter(OrdenPago.id_orden_pago == id_orden).first()


@handle_db_exceptions
def get_ordenes_pago(db: Session, current_user: dict):
    """
    Obtiene todas las órdenes de pago con sus relaciones (club, emisor, pagador)
    """
    if current_user.get("admin"):
        db_ordenes = (
            db.query(OrdenPago)
            .options(
                joinedload(OrdenPago.club),  # LEFT JOIN implícito
                joinedload(OrdenPago.emisor),
                joinedload(OrdenPago.pagador),
            )
            .all()
        )
    else:
        db_ordenes = (
            db.query(OrdenPago)
            .options(
                joinedload(OrdenPago.club),
                joinedload(OrdenPago.emisor),
                joinedload(OrdenPago.pagador),
            )
            .filter(OrdenPago.id_club == current_user.get("id_club"))
            .all()
        )

    if not db_ordenes:
        raise HTTPException(
            status_code=404, detail="No hay órdenes de pago registradas."
        )

    ordenes_salida = []
    for orden in db_ordenes:
        # Solo necesitamos mapear los campos que tienen nombres diferentes
        orden_dict = {
            **orden.__dict__,
            "nombre_club": orden.club.nombre_club if orden.club else None,
            "usuario_emisor": (
                f"{orden.emisor.nombre_usuario} {orden.emisor.apellido_usuario}"
                if orden.emisor
                else None
            ),
            "usuario_pago": (
                f"{orden.pagador.nombre_usuario} {orden.pagador.apellido_usuario}"
                if orden.pagador
                else None
            ),
        }
        orden_dict.pop("_sa_instance_state", None)  # Eliminar atributo SQLAlchemy
        ordenes_salida.append(OrdenPagoRead.model_validate(orden_dict))

    return ordenes_salida


@handle_db_exceptions
def create_orden_pago(
    db: Session, orden_pago: OrdenPagoCreate, current_user: dict
) -> OrdenPago:
    try:
        if not current_user.get("admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso de crear una orden de pago",
            )

        orden_dict = orden_pago.model_dump(mode="json")

        # Si id_club es 0 o "0", lo ponemos en None
        if orden_dict.get("id_club") in (0, "0"):
            orden_dict["id_club"] = None

        db_orden_pago = OrdenPago(**orden_dict)
        db_orden_pago.usuario_emisor = current_user.get("rut_usuario")

        if db_orden_pago.id_club:
            db_club = db.query(Club).filter(Club.id_club == orden_pago.id_club)
            if not db_club:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Club no encontrado"
                )

        db.add(db_orden_pago)
        db.commit()
        db.refresh(db_orden_pago)
        return db_orden_pago
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=400, detail="Error de integridad en la base de datos."
        ) from e


@handle_db_exceptions
def delete_orden_pago(
    db: Session, id_orden: str, current_user: dict
) -> bool:
    if not current_user.get("admin"): raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para eliminar una orden de pago")
    db_orden = get_orden_pago(db, id_orden)

    if not db_orden: raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Orden no encontrada")

    print("ESTADO")
    print(db_orden.estado_orden == EstadoOrdenEnum.anulada)
    if db_orden.estado_orden != EstadoOrdenEnum.anulada: raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No puedes eliminar una orden que no este anulada")
    db.delete(db_orden)
    db.commit()
    return True


@handle_db_exceptions
def get_ingresos(db: Session) -> IngresosMes:
    now = datetime.now()

    # Primer y último día del mes actual completos
    first_day_current = datetime(now.year, now.month, 1)
    last_day_current = datetime(
        now.year, now.month, monthrange(now.year, now.month)[1], 23, 59, 59
    )

    # Primer y último día del mes anterior completos
    first_day_prev = (first_day_current - timedelta(days=1)).replace(day=1)
    last_day_prev = first_day_current - timedelta(seconds=1)

    # Total ingresos mes actual
    total_actual = (
        db.query(func.sum(OrdenPago.monto))
        .filter(
            OrdenPago.tipo_movimiento == TipoMovimientoEnum.ingreso,
            OrdenPago.fecha_emision >= first_day_current,
            OrdenPago.fecha_emision <= last_day_current,
            OrdenPago.estado_orden == EstadoOrdenEnum.pagada,
        )
        .scalar()
        or 0
    )

    # Total ingresos mes anterior
    total_anterior = (
        db.query(func.sum(OrdenPago.monto))
        .filter(
            OrdenPago.tipo_movimiento == TipoMovimientoEnum.ingreso,
            OrdenPago.fecha_emision >= first_day_prev,
            OrdenPago.fecha_emision <= last_day_prev,
            OrdenPago.estado_orden == EstadoOrdenEnum.pagada,
        )
        .scalar()
        or 0
    )

    # Variación vs mes anterior
    if total_anterior == 0:
        variacion = "+100%" if total_actual > 0 else "0%"
    else:
        diff = ((total_actual - total_anterior) / total_anterior) * 100
        signo = "+" if diff >= 0 else ""
        variacion = f"{signo}{diff:.0f}%"

    # Formato CLP (ej: 2.245.000)
    total_str = int(total_actual)

    return IngresosMes(total_ingresos=total_str, variacion=variacion)


@handle_db_exceptions
def get_egresos(db: Session) -> EgresosMes:
    now = datetime.now()

    # calcula primer día del mes actual y primer día del siguiente mes
    first_day_current = datetime(now.year, now.month, 1)
    if now.month == 12:
        first_day_next = datetime(now.year + 1, 1, 1)
    else:
        first_day_next = datetime(now.year, now.month + 1, 1)

    # calcula primer día del mes anterior
    if now.month == 1:
        first_day_prev = datetime(now.year - 1, 12, 1)
    else:
        first_day_prev = datetime(now.year, now.month - 1, 1)

    # primer día del mes actual ya se usa como límite superior para el mes anterior
    # total egresos mes actual (>= first_day_current AND < first_day_next)
    total_actual = (
        db.query(func.coalesce(func.sum(OrdenPago.monto), 0))
        .filter(
            OrdenPago.tipo_movimiento == TipoMovimientoEnum.egreso,
            OrdenPago.fecha_emision >= first_day_current,
            OrdenPago.fecha_emision < first_day_next,
            OrdenPago.estado_orden == EstadoOrdenEnum.pagada,
        )
        .scalar()
    ) or 0

    # total egresos mes anterior (>= first_day_prev AND < first_day_current)
    total_anterior = (
        db.query(func.coalesce(func.sum(OrdenPago.monto), 0))
        .filter(
            OrdenPago.tipo_movimiento == TipoMovimientoEnum.egreso,
            OrdenPago.fecha_emision >= first_day_prev,
            OrdenPago.fecha_emision < first_day_current,
            OrdenPago.estado_orden == EstadoOrdenEnum.pagada,
        )
        .scalar()
    ) or 0

    # Asegurar valores numéricos (float/int)
    total_actual = float(total_actual)
    total_anterior = float(total_anterior)

    # cálculo de variación
    if total_anterior == 0:
        if total_actual == 0:
            variacion = "0% vs mes anterior"
        else:
            variacion = "+100% vs mes anterior"
    else:
        diff = ((total_actual - total_anterior) / total_anterior) * 100
        signo = "+" if diff >= 0 else ""
        variacion = f"{signo}{diff:.0f}%"

    # formateo CLP: $1.045.000
    total_str = int(round(total_actual))

    return EgresosMes(total_egresos=total_str, variacion=variacion)


@handle_db_exceptions
def cancel_orden(
    db: Session, id_orden_pago: str, current_user: dict
) -> EstadoOrdenEnum:

    if not current_user.get("admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso de modificar una orden de pago",
        )
    db_orden = (
        db.query(OrdenPago).filter(OrdenPago.id_orden_pago == id_orden_pago).first()
    )

    if not db_orden:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Orden de pago no encontrada"
        )

    if (
        db_orden.estado_orden == EstadoOrdenEnum.pagada
        or db_orden.estado_orden == EstadoOrdenEnum.anulada
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes anular esta orden",
        )

    db_orden.estado_orden = EstadoOrdenEnum.anulada

    db.commit()
    db.refresh(db_orden)

    return db_orden.estado_orden


@handle_db_exceptions
def pay_orden(db: Session, id_orden_pago: str, orden: OrdenPagoPay, current_user: dict) -> EstadoOrdenEnum:

    if not current_user.get("admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso de modificar una orden de pago",
        )

    db_orden = db.query(OrdenPago).filter(OrdenPago.id_orden_pago == id_orden_pago).first()

    if not db_orden:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Orden de pago no encontrada"
        )

    if db_orden.estado_orden in [EstadoOrdenEnum.pagada, EstadoOrdenEnum.anulada]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes modificar una orden que esté anulada o pagada",
        )

    # Seteamos el estado
    db_orden.estado_orden = EstadoOrdenEnum.pagada

    # Actualizamos solo los campos que vienen en la request
    orden_data = orden.model_dump(exclude_none=True)
    for key, value in orden_data.items():
        if hasattr(db_orden, key):
            setattr(db_orden, key, value if not (isinstance(value, str) and value.strip() == "") else None)

    # Si quieres poner la fecha de pago al actualizar
    db_orden.fecha_pago = datetime.now(timezone.utc)

    db.commit()
    db.refresh(db_orden)
    return db_orden.estado_orden

@handle_db_exceptions
def pending_orden(db: Session, id_orden_pago: str, current_user: dict) -> bool:
    if not current_user.get("admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso de modificar una orden de pago",
        )

    db_orden = db.query(OrdenPago).filter(OrdenPago.id_orden_pago == id_orden_pago).first()

    if not db_orden:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Orden de pago no encontrada"
        )

    if db_orden.estado_orden in [EstadoOrdenEnum.anulada, EstadoOrdenEnum.pendiente]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes modificar una orden que esté anulada o que ya se encuentre pendiente",
        )
    
    # Cambiamos el estado a pendiente
    db_orden.estado_orden = EstadoOrdenEnum.pendiente

    # Limpiamos los campos relacionados con el pago
    db_orden.tipo_pago = TipoPagoEnum.na
    db_orden.metodo_pago = None
    db_orden.numero_transaccion = None
    db_orden.usuario_pago = None
    db_orden.fecha_pago = None  # también limpia la fecha de pago si quieres

    db.commit()
    db.refresh(db_orden)
    return True

