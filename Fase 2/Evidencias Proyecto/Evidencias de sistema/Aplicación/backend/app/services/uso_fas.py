from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models import UsoFas, Fas, Jugador, DetalleClubJugador, Club
from app.schemas import UsoFasCreate, UsoFasUpdate
from sqlalchemy import func
from app import schemas

# TODO: Aplicar auth security para poder implementar auditoria

def get_usos_fas_publico(db: Session):
    """
    Devuelve un resumen público de los usos del FAS agrupados por club.
    """
    resultados = (
        db.query(
            Club.nombre_club.label("club"),
            func.count(UsoFas.rut_jugador.distinct()).label("personas"),
            func.sum(UsoFas.monto_usado).label("monto")
        )
        .join(DetalleClubJugador, DetalleClubJugador.rut_jugador == UsoFas.rut_jugador)
        .join(Club, Club.id_club == DetalleClubJugador.id_club)
        .group_by(Club.nombre_club)
        .order_by(func.sum(UsoFas.monto_usado).desc())
        .all()
    )

    return [
        {"club": r.club, "personas": r.personas, "monto": r.monto or 0}
        for r in resultados
    ]


def get_uso_fas(db: Session, uso_id: int) -> UsoFas | None:
    """Obtiene un registro de uso FAS por ID."""
    return db.query(UsoFas).filter(UsoFas.id_uso_fas == uso_id).first()


def get_usos_fas(db: Session, skip: int = 0, limit: int = 100):
    """Obtiene todos los usos FAS con el nombre del jugador y del club."""

    resultados = (
        db.query(UsoFas, Jugador, DetalleClubJugador, Club)
        .join(Jugador, Jugador.rut_jugador == UsoFas.rut_jugador)
        .join(DetalleClubJugador, DetalleClubJugador.rut_jugador == Jugador.rut_jugador)
        .join(Club, Club.id_club == DetalleClubJugador.id_club)
        .offset(skip)
        .limit(limit)
        .all()
    )

    usos = []

    for uso, jugador, detalle, club in resultados:
        
        nombre_completo = " ".join(filter(None, [
                            jugador.primer_nombre,
                            jugador.segundo_nombre,
                            jugador.primer_apellido,
                            jugador.segundo_apellido
                                ]))

        usos.append(
            schemas.UsoFasWithDetails(
                id_uso_fas=uso.id_uso_fas,
                id_fas=uso.id_fas,
                rut_jugador=uso.rut_jugador,
                jugador_nombre=nombre_completo,
                club_nombre=club.nombre,
                monto_usado=uso.monto_usado,
                descripcion_gasto=uso.descripcion_gasto,
                fecha_uso=uso.fecha_uso,
                fecha_creacion=uso.fecha_creacion,
                fecha_modificacion=uso.fecha_modificacion,
            )
        )

    return usos


def create_uso_fas(db: Session, uso_data: UsoFasCreate) -> UsoFas:
    """Crea un nuevo registro de uso de fondo FAS."""
    # Verificar si el jugador existe
    jugador = db.query(Jugador).filter(Jugador.rut_jugador == uso_data.rut_jugador).first()
    if not jugador:
        raise HTTPException(status_code=404, detail="No se encontró un jugador con el RUT ingresado.")

    # Verificar si el FAS existe y está activo
    fas = db.query(Fas).filter(Fas.id_fas == uso_data.id_fas).first()
    if not fas:
        raise HTTPException(status_code=404, detail="No se encontró un fondo FAS activo con el ID ingresado.")

    # Validar que haya suficiente dinero disponible
    if uso_data.monto_usado > fas.monto_disponible:
        raise HTTPException(
            status_code=400,
            detail=f"Fondos insuficientes. Disponible: {fas.monto_disponible}, solicitado: {uso_data.monto_usado}"
        )

    # Crear registro de uso
    db_uso = UsoFas(**uso_data.dict())
    db.add(db_uso)

    # Descontar del monto disponible del FAS
    fas.monto_disponible -= uso_data.monto_usado

    db.commit()
    db.refresh(db_uso)
    return db_uso


def update_uso_fas(db: Session, uso_id: int, uso_update: UsoFasUpdate) -> UsoFas | None:
    """Actualiza un registro de uso FAS."""
    db_uso = get_uso_fas(db, uso_id)
    if not db_uso:
        return None

    for key, value in uso_update.dict(exclude_unset=True).items():
        setattr(db_uso, key, value)

    db.commit()
    db.refresh(db_uso)
    return db_uso


def delete_uso_fas(db: Session, uso_id: int) -> bool:
    """Elimina un uso FAS y devuelve el monto al fondo."""
    db_uso = get_uso_fas(db, uso_id)
    if not db_uso:
        return False

    fas = db.query(Fas).filter(Fas.id_fas == db_uso.id_fas).first()
    if fas:
        fas.monto_disponible += db_uso.monto_usado  # Se devuelve el monto al fondo

    db.delete(db_uso)
    db.commit()
    return True