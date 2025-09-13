from sqlalchemy.orm import Session
from app.models import Permiso
from app.schemas import PermisoCreate, PermisoUpdate


def get_permiso(db: Session, id_permiso: int) -> Permiso | None:
    return db.query(Permiso).filter(Permiso.id_permiso == id_permiso).first()


def get_permisos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Permiso).offset(skip).limit(limit).all()


def create_permiso(db: Session, permiso: PermisoCreate) -> Permiso:
    db_permiso = Permiso(**permiso.dict())
    db.add(db_permiso)
    db.commit()
    db.refresh(db_permiso)
    return db_permiso


def update_permiso(
    db: Session, id_permiso: int, permiso_update: PermisoUpdate
) -> Permiso | None:
    db_permiso = get_permiso(db, id_permiso)
    if not db_permiso:
        return None
    for key, value in permiso_update.dict(exclude_unset=True).items():
        setattr(db_permiso, key, value)
    db.commit()
    db.refresh(db_permiso)
    return db_permiso


def delete_permiso(db: Session, id_permiso: int) -> bool:
    db_permiso = get_permiso(db, id_permiso)
    if not db_permiso:
        return False
    db.delete(db_permiso)
    db.commit()
    return True
