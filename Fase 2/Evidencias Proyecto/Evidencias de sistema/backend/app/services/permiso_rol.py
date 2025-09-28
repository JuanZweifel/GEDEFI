from sqlalchemy.orm import Session
from app.models import permiso_rol
from app.schemas import PermisoRolCreate, PermisoRolUpdate


def get_permiso_rol(
    db: Session, id_permiso: int, id_rol: int
) -> permiso_rol.PermisoRol | None:
    return (
        db.query(permiso_rol.PermisoRol)
        .filter(
            permiso_rol.PermisoRol.id_permiso == id_permiso,
            permiso_rol.PermisoRol.id_rol == id_rol,
        )
        .first()
    )


def get_permisos_roles(db: Session, skip: int = 0, limit: int = 100):
    return db.query(permiso_rol.PermisoRol).offset(skip).limit(limit).all()


def create_permiso_rol(
    db: Session, permiso_rol_data: PermisoRolCreate
) -> permiso_rol.PermisoRol:
    db_permiso_rol = permiso_rol.PermisoRol(**permiso_rol_data.dict())
    db.add(db_permiso_rol)
    db.commit()
    db.refresh(db_permiso_rol)
    return db_permiso_rol


def update_permiso_rol(
    db: Session, id_permiso: int, id_rol: int, permiso_rol_update: PermisoRolUpdate
) -> permiso_rol.PermisoRol | None:
    db_permiso_rol = get_permiso_rol(db, id_permiso, id_rol)
    if not db_permiso_rol:
        return None
    for key, value in permiso_rol_update.dict(exclude_unset=True).items():
        setattr(db_permiso_rol, key, value)
    db.commit()
    db.refresh(db_permiso_rol)
    return db_permiso_rol


def delete_permiso_rol(db: Session, id_permiso: int, id_rol: int) -> bool:
    db_permiso_rol = get_permiso_rol(db, id_permiso, id_rol)
    if not db_permiso_rol:
        return False
    db.delete(db_permiso_rol)
    db.commit()
    return True
