from sqlalchemy.orm import Session
from app.models import Serie
from app.schemas import SerieCreate, SerieRead
from sqlalchemy import and_

def get_serie(db: Session, id_serie: int) -> Serie | None:
    return (
        db.query(Serie)
        .filter(Serie.id_serie == id_serie)
        .first()
    )

def get_series(db: Session, skip: int = 0, limit: int = 100) -> list[Serie]:
    return db.query(Serie).offset(skip).limit(limit).all()

def create_serie(db: Session, serie: SerieCreate) -> Serie:
    db_serie = Serie(**serie.dict())
    db.add(db_serie)
    db.commit()
    db.refresh(db_serie)
    return db_serie

def delete_serie(db: Session, id_serie: int) -> bool:
    db_serie = get_serie(db, id_serie)
    if not db_serie:
        return False
    db.delete(db_serie)
    db.commit()
    return True