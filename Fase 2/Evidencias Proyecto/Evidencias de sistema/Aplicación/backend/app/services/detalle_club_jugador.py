from sqlalchemy.orm import Session
from app.models import DetalleClubJugador
from app.schemas import DetalleClubJugadorCreate, DetalleClubJugadorUpdate


def get_detalle_club_jugador(db: Session, rut_jugador: str, id_club: int, fecha_ini: str) -> DetalleClubJugador | None:
    return db.query(DetalleClubJugador).filter(
        DetalleClubJugador.rut_jugador == rut_jugador,
        DetalleClubJugador.id_club == id_club,
        DetalleClubJugador.fecha_ini == fecha_ini
    ).first()


def get_detalles_club_jugador(db: Session, skip: int = 0, limit: int = 100):
    return db.query(DetalleClubJugador).offset(skip).limit(limit).all()


def create_detalle_club_jugador(db: Session, detalle: DetalleClubJugadorCreate) -> DetalleClubJugador:
    db_detalle = DetalleClubJugador(**detalle.dict())
    db.add(db_detalle)
    db.commit()
    db.refresh(db_detalle)
    return db_detalle


def update_detalle_club_jugador(
    db: Session, rut_jugador: str, id_club: int, fecha_ini: str, detalle_update: DetalleClubJugadorUpdate
) -> DetalleClubJugador | None:
    db_detalle = get_detalle_club_jugador(db, rut_jugador, id_club, fecha_ini)
    if not db_detalle:
        return None
    for key, value in detalle_update.dict(exclude_unset=True).items():
        setattr(db_detalle, key, value)
    db.commit()
    db.refresh(db_detalle)
    return db_detalle


def delete_detalle_club_jugador(db: Session, rut_jugador: str, id_club: int, fecha_ini: str) -> bool:
    db_detalle = get_detalle_club_jugador(db, rut_jugador, id_club, fecha_ini)
    if not db_detalle:
        return False
    db.delete(db_detalle)
    db.commit()
    return True