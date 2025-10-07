from sqlalchemy.orm import Session
from app.models import Partido
from app.schemas import PartidoCreate, PartidoUpdate


def get_partido(db: Session, partido_id: int) -> Partido | None:
    return db.query(Partido).filter(Partido.id_partido == partido_id).first()


def get_partidos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Partido).offset(skip).limit(limit).all()


def create_partido(db: Session, partido: PartidoCreate) -> Partido:
    db_partido = Partido(**partido.dict())
    db.add(db_partido)
    db.commit()
    db.refresh(db_partido)
    return db_partido


def update_partido(db: Session, partido_id: int, partido_update: PartidoUpdate) -> Partido | None:
    db_partido = get_partido(db, partido_id)
    if not db_partido:
        return None
    for key, value in partido_update.dict(exclude_unset=True).items():
        setattr(db_partido, key, value)
    db.commit()
    db.refresh(db_partido)
    return db_partido


def delete_partido(db: Session, partido_id: int) -> bool:
    db_partido = get_partido(db, partido_id)
    if not db_partido:
        return False
    db.delete(db_partido)
    db.commit()
    return True