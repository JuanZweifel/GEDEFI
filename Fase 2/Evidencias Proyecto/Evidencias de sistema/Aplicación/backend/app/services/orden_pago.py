from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import OrdenPago, Usuario, Club
from app.schemas import OrdenPagoCreate, OrdenPagoRead, IngresosMes, EgresosMes
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, Depends, status

from app.utils.decorators import handle_db_exceptions
from app.security import get_current_user
from datetime import datetime, timedelta
from calendar import monthrange

@handle_db_exceptions
def get_orden_pago(db: Session, id_orden: int, current_user: Usuario = Depends(get_current_user)) -> OrdenPago | None:
    return db.query(OrdenPago).filter(OrdenPago.id_orden_pago == id_orden).first()

@handle_db_exceptions
def get_ordenes_pago(db: Session, current_user: Usuario = Depends(get_current_user)):
    db_ordenes = db.query(OrdenPago).all()
    if not db_ordenes: raise HTTPException(status_code=404, detail="No hay ordenes de pago registradas.")
    ordenes = [OrdenPagoRead.model_validate(orden) for orden in db_ordenes]

    for orden in ordenes:
        if not orden.id_club: 
            pass
        db_club = db.query(Club).filter(Club.id_club == orden.id_club).first()
        orden.nombre_club = db_club.nombre_club
    return ordenes

@handle_db_exceptions
def create_orden_pago(db: Session, orden_pago: OrdenPagoCreate, current_user: dict) -> OrdenPago:
    try:
        rut_usuario = current_user["rut_usuario"]
        db_orden_pago = OrdenPago(**orden_pago.model_dump(mode="json"))
        db_orden_pago.usuario_emisor = rut_usuario

        if orden_pago.id_club:
            db_club = db.query(Club).filter(Club.id_club == orden_pago.id_club)
            if not db_club: raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club no encontrado")

        db.add(db_orden_pago)
        db.commit()
        db.refresh(db_orden_pago)
        return db_orden_pago
    except IntegrityError as e:
        print(e) # WARNING: SE DEBE ELIMINAR EL PRINT CUANDO ESTE PROBADO EL METODO
        db.rollback()
        raise HTTPException(status_code=400, detail="Error de integridad en la base de datos.") from e

@handle_db_exceptions
def delete_orden_pago(db: Session, id_orden: int, current_user: Usuario = Depends(get_current_user)) -> dict:
    db_orden_pago = get_orden_pago(db, id_orden)
    db.delete(db_orden_pago)
    db.commit()
    return {"details": "Orden de pago eliminada exitosamente."}

@handle_db_exceptions
def get_ingresos(db: Session) -> IngresosMes:
    now = datetime.now()

    # Primer y último día del mes actual completos
    first_day_current = datetime(now.year, now.month, 1)
    last_day_current = datetime(now.year, now.month, monthrange(now.year, now.month)[1], 23, 59, 59)

    # Primer y último día del mes anterior completos
    first_day_prev = (first_day_current - timedelta(days=1)).replace(day=1)
    last_day_prev = first_day_current - timedelta(seconds=1)

    # Total ingresos mes actual
    total_actual = (
        db.query(func.sum(OrdenPago.monto))
        .filter(
            OrdenPago.tipo_movimiento.ilike("ingreso"),
            OrdenPago.fecha_emision >= first_day_current,
            OrdenPago.fecha_emision <= last_day_current,
            OrdenPago.orden_activa == True
        )
        .scalar() or 0
    )

    # Total ingresos mes anterior
    total_anterior = (
        db.query(func.sum(OrdenPago.monto))
        .filter(
            OrdenPago.tipo_movimiento.ilike("ingreso"),
            OrdenPago.fecha_emision >= first_day_prev,
            OrdenPago.fecha_emision <= last_day_prev,
            OrdenPago.orden_activa == True
        )
        .scalar() or 0
    )

    # Variación vs mes anterior
    if total_anterior == 0:
        variacion = "+100%" if total_actual > 0 else "0%"
    else:
        diff = ((total_actual - total_anterior) / total_anterior) * 100
        signo = "+" if diff >= 0 else ""
        variacion = f"{signo}{diff:.0f}% vs mes anterior"

    # Formato CLP (ej: 2.245.000)
    total_str = f"{int(total_actual):,}".replace(",", ".")

    return IngresosMes(
        total_ingresos=total_str,
        variacion=variacion
    )

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
            func.lower(OrdenPago.tipo_movimiento) == "egreso",
            OrdenPago.fecha_emision >= first_day_current,
            OrdenPago.fecha_emision < first_day_next,
            OrdenPago.orden_activa == True,
        )
        .scalar()
    ) or 0

    # total egresos mes anterior (>= first_day_prev AND < first_day_current)
    total_anterior = (
        db.query(func.coalesce(func.sum(OrdenPago.monto), 0))
        .filter(
            func.lower(OrdenPago.tipo_movimiento) == "egreso",
            OrdenPago.fecha_emision >= first_day_prev,
            OrdenPago.fecha_emision < first_day_current,
            OrdenPago.orden_activa == True,
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
        variacion = f"{signo}{diff:.0f}% vs mes anterior"

    # formateo CLP: $1.045.000
    total_str = f"${int(round(total_actual)):,}".replace(",", ".")

    return EgresosMes(
        total_egresos=total_str,
        variacion=variacion
    )