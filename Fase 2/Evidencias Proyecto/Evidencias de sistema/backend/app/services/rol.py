from sqlalchemy.orm import Session
from app.models import rol
from app.schemas import RolCreate, RolUpdate


def get_rol(db: Session, id_rol: int) -> rol.Rol | None:
    return db.query(rol.Rol).filter(rol.Rol.id_rol == id_rol).first()


def get_roles(db: Session, skip: int = 0, limit: int = 100):
    return db.query(rol.Rol).offset(skip).limit(limit).all()


def create_rol(db: Session, rol_data: RolCreate) -> rol.Rol:
    db_rol = rol.Rol(**rol_data.dict())
    db.add(db_rol)
    db.commit()
    db.refresh(db_rol)
    return db_rol


def update_rol(db: Session, id_rol: int, rol_update: RolUpdate) -> rol.Rol | None:
    db_rol = get_rol(db, id_rol)
    if not db_rol:
        return None
    for key, value in rol_update.dict(exclude_unset=True).items():
        setattr(db_rol, key, value)
    db.commit()
    db.refresh(db_rol)
    return db_rol


def delete_rol(db: Session, id_rol: int) -> bool:
    db_rol = get_rol(db, id_rol)
    if not db_rol:
        return False
    db.delete(db_rol)
    db.commit()
    return True


def disable_rol(db: Session, id_rol: int) -> rol.Rol | None:
    db_rol = get_rol(db, id_rol)
    if not db_rol:
        return None
    db_rol.rol_activo = False
    db.commit()
    db.refresh(db_rol)
    return db_rol
