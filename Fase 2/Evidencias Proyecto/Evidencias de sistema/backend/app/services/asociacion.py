from sqlalchemy.orm import Session
from app.models import Asociacion
from app.schemas import AsociacionCreate, AsociacionUpdate


def get_asociacion(db: Session, asociacion_id: int) -> Asociacion | None:
    return (
        db.query(Asociacion).filter(Asociacion.id_asociacion == asociacion_id).first()
    )


def get_asociaciones(db: Session, skip: int = 0, limit: int = 100) -> list[Asociacion]:
    return db.query(Asociacion).offset(skip).limit(limit).all()


def create_asociacion(db: Session, asociacion: AsociacionCreate) -> Asociacion:
    db_asociacion = Asociacion(**asociacion.dict())
    db.add(db_asociacion)
    db.commit()
    db.refresh(db_asociacion)
    return db_asociacion


def update_asociacion(
    db: Session, asociacion_id: int, asociacion_update: AsociacionUpdate
) -> Asociacion | None:
    db_asociacion = get_asociacion(db, asociacion_id)
    if not db_asociacion:
        return None
    for key, value in asociacion_update.dict(exclude_unset=True).items():
        setattr(db_asociacion, key, value)
    db.commit()
    db.refresh(db_asociacion)
    return db_asociacion


def delete_asociacion(db: Session, asociacion_id: int) -> bool:
    db_asociacion = get_asociacion(db, asociacion_id)
    if not db_asociacion:
        return False
    db.delete(db_asociacion)
    db.commit()
    return True
