from sqlalchemy.orm import Session
from app.models import Lesion
from app.schemas import LesionCreate, LesionUpdate


def get_lesion(db: Session, lesion_id: int) -> Lesion | None:
    return db.query(Lesion).filter(Lesion.id_lesion == lesion_id).first()


def get_lesiones(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Lesion).offset(skip).limit(limit).all()


def create_lesion(db: Session, lesion: LesionCreate) -> Lesion:
    db_lesion = Lesion(**lesion.dict())
    db.add(db_lesion)
    db.commit()
    db.refresh(db_lesion)
    return db_lesion


def update_lesion(
    db: Session, lesion_id: int, lesion_update: LesionUpdate
) -> Lesion | None:
    db_lesion = get_lesion(db, lesion_id)
    if not db_lesion:
        return None
    for key, value in lesion_update.dict(exclude_unset=True).items():
        setattr(db_lesion, key, value)
    db.commit()
    db.refresh(db_lesion)
    return db_lesion


def delete_lesion(db: Session, lesion_id: int) -> bool:
    db_lesion = get_lesion(db, lesion_id)
    if not db_lesion:
        return False
    db.delete(db_lesion)
    db.commit()
    return True