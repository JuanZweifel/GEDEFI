from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models import archivo
from app.schemas import ArchivoCreate, ArchivoUpdate


def get_archivo(db: Session, id_archivo: int) -> archivo.Archivo | None:
    return (
        db.query(archivo.Archivo)
        .filter(archivo.Archivo.id_archivo == id_archivo)
        .first()
    )


def get_archivos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(archivo.Archivo).offset(skip).limit(limit).all()


def create_archivo(db: Session, archivo_data: ArchivoCreate) -> archivo.Archivo:
    db_archivo = archivo.Archivo(**archivo_data.dict())
    db.add(db_archivo)
    db.commit()
    db.refresh(db_archivo)
    return db_archivo


def update_archivo(
    db: Session, id_archivo: int, archivo_update: ArchivoUpdate
) -> archivo.Archivo | None:
    db_archivo = get_archivo(db, id_archivo)
    if not db_archivo:
        return None
    for key, value in archivo_update.dict(exclude_unset=True).items():
        setattr(db_archivo, key, value)
    db.commit()
    db.refresh(db_archivo)
    return db_archivo


def delete_archivo(db: Session, id_archivo: int) -> bool:
    db_archivo = get_archivo(db, id_archivo)
    if not db_archivo:
        return False
    db.delete(db_archivo)
    db.commit()
    return True
