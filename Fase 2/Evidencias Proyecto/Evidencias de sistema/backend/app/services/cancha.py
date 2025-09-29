from sqlalchemy.orm import Session
from app.models import Cancha
from app.schemas import CanchaCreate, CanchaUpdate


def get_cancha(db: Session, cancha_id: int) -> Cancha | None:
    return db.query(Cancha).filter(Cancha.id_cancha == cancha_id).first()


def get_canchas(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Cancha).offset(skip).limit(limit).all()


def create_cancha(db: Session, cancha: CanchaCreate) -> Cancha:
    db_cancha = Cancha(**cancha.dict())
    db.add(db_cancha)
    db.commit()
    db.refresh(db_cancha)
    return db_cancha


def update_cancha(db: Session, cancha_id: int, cancha_update: CanchaUpdate) -> Cancha | None:
    db_cancha = get_cancha(db, cancha_id)
    if not db_cancha:
        return None
    for key, value in cancha_update.dict(exclude_unset=True).items():
        setattr(db_cancha, key, value)
    db.commit()
    db.refresh(db_cancha)
    return db_cancha


def delete_cancha(db: Session, cancha_id: int) -> bool:
    db_cancha = get_cancha(db, cancha_id)
    if not db_cancha:
        return False
    db.delete(db_cancha)
    db.commit()
    return True