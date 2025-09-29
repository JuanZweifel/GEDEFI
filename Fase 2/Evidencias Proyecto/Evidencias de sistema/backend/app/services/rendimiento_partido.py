from sqlalchemy.orm import Session
from app.models import RendimientoPartido
from app.schemas import RendimientoPartidoCreate, RendimientoPartidoUpdate


def get_rendimiento_partido(db: Session, id_partido: int, rut_jugador: str, id_serie: int) -> RendimientoPartido | None:
    return db.query(RendimientoPartido).filter(
        RendimientoPartido.id_partido == id_partido,
        RendimientoPartido.rut_jugador == rut_jugador,
        RendimientoPartido.id_serie == id_serie
    ).first()


def get_rendimientos_partido(db: Session, skip: int = 0, limit: int = 100):
    return db.query(RendimientoPartido).offset(skip).limit(limit).all()


def create_rendimiento_partido(db: Session, rendimiento: RendimientoPartidoCreate) -> RendimientoPartido:
    db_rendimiento = RendimientoPartido(**rendimiento.dict())
    db.add(db_rendimiento)
    db.commit()
    db.refresh(db_rendimiento)
    return db_rendimiento


def update_rendimiento_partido(
    db: Session, id_partido: int, rut_jugador: str, id_serie: int, rendimiento_update: RendimientoPartidoUpdate
) -> RendimientoPartido | None:
    db_rendimiento = get_rendimiento_partido(db, id_partido, rut_jugador, id_serie)
    if not db_rendimiento:
        return None
    for key, value in rendimiento_update.dict(exclude_unset=True).items():
        setattr(db_rendimiento, key, value)
    db.commit()
    db.refresh(db_rendimiento)
    return db_rendimiento


def delete_rendimiento_partido(db: Session, id_partido: int, rut_jugador: str, id_serie: int) -> bool:
    db_rendimiento = get_rendimiento_partido(db, id_partido, rut_jugador, id_serie)
    if not db_rendimiento:
        return False
    db.delete(db_rendimiento)
    db.commit()
    return True