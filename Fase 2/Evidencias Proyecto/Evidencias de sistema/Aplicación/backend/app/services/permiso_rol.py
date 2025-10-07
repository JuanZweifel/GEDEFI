from sqlalchemy.orm import Session
from app import models, schemas
from datetime import datetime, timezone


# Asignar un solo permiso a un rol
def create_permiso_rol(db: Session, permiso_rol_data: schemas.PermisoRolCreate):
    db_permiso_rol = models.PermisoRol(**permiso_rol_data.dict())
    db.add(db_permiso_rol)
    db.commit()
    db.refresh(db_permiso_rol)
    return db_permiso_rol


# Asignar múltiples permisos a un rol
def create_permisos_roles(db: Session, id_rol: int, permisos_ids: list[int]):
    resultado = []
    now = datetime.now(timezone.utc)
    for pid in permisos_ids:
        db_permiso_rol = models.PermisoRol(
            id_rol=id_rol, id_permiso=pid, fecha_ini_permiso_rol=now
        )
        db.add(db_permiso_rol)
        resultado.append(db_permiso_rol)
    db.commit()
    for r in resultado:
        db.refresh(r)
    return resultado


def get_permiso_rol(db: Session, fecha_ini, id_rol, id_permiso):
    return (
        db.query(models.PermisoRol)
        .filter_by(
            fecha_ini_permiso_rol=fecha_ini, id_rol=id_rol, id_permiso=id_permiso
        )
        .first()
    )


def get_permisos_roles(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.PermisoRol).offset(skip).limit(limit).all()


# Listar todos los permisos de un rol
def get_permisos_de_rol(db: Session, id_rol: int):
    return db.query(models.PermisoRol).filter_by(id_rol=id_rol).all()


# Listar todos los roles que tienen un permiso
def get_roles_de_permiso(db: Session, id_permiso: int):
    return db.query(models.PermisoRol).filter_by(id_permiso=id_permiso).all()


# TODO: Revisar la logica de actualización, deberia solamente permitir actualizar fecha_fin_permiso_rol?
def update_permiso_rol(
    db: Session,
    fecha_ini,
    id_rol,
    id_permiso,
    permiso_rol_update: schemas.PermisoRolUpdate,
):
    db_permiso_rol = get_permiso_rol(db, fecha_ini, id_rol, id_permiso)
    if not db_permiso_rol:
        return None
    for key, value in permiso_rol_update.dict(exclude_unset=True).items():
        setattr(db_permiso_rol, key, value)
    db.commit()
    db.refresh(db_permiso_rol)
    return db_permiso_rol


def delete_permiso_rol(db: Session, fecha_ini, id_rol, id_permiso):
    db_permiso_rol = get_permiso_rol(db, fecha_ini, id_rol, id_permiso)
    if not db_permiso_rol:
        return False
    db.delete(db_permiso_rol)
    db.commit()
    return True
