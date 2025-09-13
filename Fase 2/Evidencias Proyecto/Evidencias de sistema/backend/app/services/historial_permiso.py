from sqlalchemy.orm import Session
from app.models import HistorialPermiso
from app.schemas import HistorialPermisoCreate, HistorialPermisoUpdate
from datetime import datetime


def get_historial_permiso(
    db: Session, correo_usu: str, id_permiso: int, fecha_ini_permiso: datetime
) -> HistorialPermiso | None:
    return (
        db.query(HistorialPermiso)
        .filter(
            HistorialPermiso.correo_usu == correo_usu,
            HistorialPermiso.id_permiso == id_permiso,
            HistorialPermiso.fecha_ini_permiso == fecha_ini_permiso,
        )
        .first()
    )


def get_historiales_permiso(db: Session, skip: int = 0, limit: int = 100):
    return db.query(HistorialPermiso).offset(skip).limit(limit).all()


def get_historiales_permiso_por_usuario(
    db: Session, correo_usu: str, skip: int = 0, limit: int = 100
):
    return (
        db.query(HistorialPermiso)
        .filter(HistorialPermiso.correo_usu == correo_usu)
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_historial_permiso(
    db: Session, historial_permiso: HistorialPermisoCreate
) -> HistorialPermiso:
    db_historial_permiso = HistorialPermiso(**historial_permiso.dict())
    db.add(db_historial_permiso)
    db.commit()
    db.refresh(db_historial_permiso)
    return db_historial_permiso


def update_historial_permiso(
    db: Session,
    correo_usu: str,
    id_permiso: int,
    fecha_ini_permiso: datetime,
    historial_permiso_update: HistorialPermisoUpdate,
) -> HistorialPermiso | None:
    db_historial_permiso = get_historial_permiso(
        db, correo_usu, id_permiso, fecha_ini_permiso
    )
    if not db_historial_permiso:
        return None
    for key, value in historial_permiso_update.dict(exclude_unset=True).items():
        setattr(db_historial_permiso, key, value)
    db.commit()
    db.refresh(db_historial_permiso)
    return db_historial_permiso


def delete_historial_permiso(
    db: Session, correo_usu: str, id_permiso: int, fecha_ini_permiso: datetime
) -> bool:
    db_historial_permiso = get_historial_permiso(
        db, correo_usu, id_permiso, fecha_ini_permiso
    )
    if not db_historial_permiso:
        return False
    db.delete(db_historial_permiso)
    db.commit()
    return True
