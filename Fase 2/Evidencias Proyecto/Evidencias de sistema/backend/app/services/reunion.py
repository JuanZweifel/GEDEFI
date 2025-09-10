from sqlalchemy.orm import Session
from app.models import Reunion
from app.schemas import ReunionCreate, ReunionUpdate


def get_reunion(db: Session, reunion_id: int) -> Reunion | None:
    return db.query(Reunion).filter(Reunion.id_reunion == reunion_id).first()


def get_reuniones(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Reunion).offset(skip).limit(limit).all()


def create_reunion(db: Session, reunion: ReunionCreate) -> Reunion:
    db_reunion = Reunion(**reunion.dict())
    db.add(db_reunion)
    db.commit()
    db.refresh(db_reunion)
    return db_reunion


def update_reunion(
    db: Session, reunion_id: int, reunion_update: ReunionUpdate
) -> Reunion | None:
    db_reunion = get_reunion(db, reunion_id)
    if not db_reunion:
        return None
    for key, value in reunion_update.dict(exclude_unset=True).items():
        setattr(db_reunion, key, value)
    db.commit()
    db.refresh(db_reunion)
    return db_reunion


def delete_reunion(db: Session, reunion_id: int) -> bool:
    db_reunion = get_reunion(db, reunion_id)
    if not db_reunion:
        return False
    db.delete(db_reunion)
    db.commit()
    return True
