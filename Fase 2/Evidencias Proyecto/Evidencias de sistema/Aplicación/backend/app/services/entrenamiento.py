from sqlalchemy.orm import Session
from app.models import entrenamiento
from app.schemas import EntrenamientoCreate, EntrenamientoUpdate


def get_entrenamiento(
    db: Session, id_entrenamiento: int
) -> entrenamiento.Entrenamiento | None:
    return (
        db.query(entrenamiento.Entrenamiento)
        .filter(entrenamiento.Entrenamiento.id_entrenamiento == id_entrenamiento)
        .first()
    )


def get_entrenamientos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(entrenamiento.Entrenamiento).offset(skip).limit(limit).all()


def create_entrenamiento(
    db: Session, entrenamiento_data: EntrenamientoCreate
) -> entrenamiento.Entrenamiento:
    db_entrenamiento = entrenamiento.Entrenamiento(**entrenamiento_data.dict())
    db.add(db_entrenamiento)
    db.commit()
    db.refresh(db_entrenamiento)
    return db_entrenamiento


def update_entrenamiento(
    db: Session, id_entrenamiento: int, entrenamiento_update: EntrenamientoUpdate
) -> entrenamiento.Entrenamiento | None:
    db_entrenamiento = get_entrenamiento(db, id_entrenamiento)
    if not db_entrenamiento:
        return None
    for key, value in entrenamiento_update.dict(exclude_unset=True).items():
        setattr(db_entrenamiento, key, value)
    db.commit()
    db.refresh(db_entrenamiento)
    return db_entrenamiento


def delete_entrenamiento(db: Session, id_entrenamiento: int) -> bool:
    db_entrenamiento = get_entrenamiento(db, id_entrenamiento)
    if not db_entrenamiento:
        return False
    db.delete(db_entrenamiento)
    db.commit()
    return True
