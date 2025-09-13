from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models import AsistenciaReunion
from app.schemas import AsistenciaReunionCreate, AsistenciaReunionUpdate


def get_asistencia_reunion(
    db: Session, id_reunion: int, correo_usu: str
) -> AsistenciaReunion | None:
    return (
        db.query(AsistenciaReunion)
        .filter(
            and_(
                AsistenciaReunion.id_reunion == id_reunion,
                AsistenciaReunion.correo_usu == correo_usu,
            )
        )
        .first()
    )


def get_asistencias_reunion(db: Session, skip: int = 0, limit: int = 100):
    return db.query(AsistenciaReunion).offset(skip).limit(limit).all()


def create_asistencia_reunion(
    db: Session, asistencia_reunion: AsistenciaReunionCreate
) -> AsistenciaReunion:
    db_asistencia_reunion = AsistenciaReunion(**asistencia_reunion.dict())
    db.add(db_asistencia_reunion)
    db.commit()
    db.refresh(db_asistencia_reunion)
    return db_asistencia_reunion


def update_asistencia_reunion(
    db: Session,
    id_reunion: int,
    correo_usu: str,
    asistencia_reunion_update: AsistenciaReunionUpdate,
) -> AsistenciaReunion | None:
    db_asistencia_reunion = get_asistencia_reunion(db, id_reunion, correo_usu)
    if not db_asistencia_reunion:
        return None
    for key, value in asistencia_reunion_update.dict(exclude_unset=True).items():
        setattr(db_asistencia_reunion, key, value)
    db.commit()
    db.refresh(db_asistencia_reunion)
    return db_asistencia_reunion


def delete_asistencia_reunion(db: Session, id_reunion: int, correo_usu: str) -> bool:
    db_asistencia_reunion = get_asistencia_reunion(db, id_reunion, correo_usu)
    if not db_asistencia_reunion:
        return False
    db.delete(db_asistencia_reunion)
    db.commit()
    return True
