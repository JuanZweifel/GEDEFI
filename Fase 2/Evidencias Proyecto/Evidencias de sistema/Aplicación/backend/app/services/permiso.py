from sqlalchemy.orm import Session
from app.models import permiso
from app.schemas import PermisoCreate, PermisoUpdate
from app.utils.decorators import handle_db_exceptions


@handle_db_exceptions
def get_permiso(db: Session, id_permiso: int) -> permiso.Permiso | None:
    return (
        db.query(permiso.Permiso)
        .filter(permiso.Permiso.id_permiso == id_permiso)
        .first()
    )


@handle_db_exceptions
def get_permisos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(permiso.Permiso).offset(skip).limit(limit).all()


@handle_db_exceptions
def create_permiso(db: Session, permiso_data: PermisoCreate) -> permiso.Permiso:
    db_permiso = permiso.Permiso(**permiso_data.dict())
    db.add(db_permiso)
    db.commit()
    db.refresh(db_permiso)
    return db_permiso


@handle_db_exceptions
def update_permiso(
    db: Session, id_permiso: int, permiso_update: PermisoUpdate
) -> permiso.Permiso | None:
    db_permiso = get_permiso(db, id_permiso)
    if not db_permiso:
        return None
    for key, value in permiso_update.dict(exclude_unset=True).items():
        setattr(db_permiso, key, value)
    db.commit()
    db.refresh(db_permiso)
    return db_permiso


@handle_db_exceptions
def delete_permiso(db: Session, id_permiso: int) -> bool:
    db_permiso = get_permiso(db, id_permiso)
    if not db_permiso:
        return False
    db.delete(db_permiso)
    db.commit()
    return True
