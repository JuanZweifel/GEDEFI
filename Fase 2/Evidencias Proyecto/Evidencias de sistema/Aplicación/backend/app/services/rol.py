from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.models import Rol, Usuario
from app.schemas import RolCreate, RolUpdate
from app.utils.decorators import handle_db_exceptions


# TODO: Aplicar auth security para poder implementar auditoria
@handle_db_exceptions
def get_rol(db: Session, id_rol: int) -> Rol | None:
    return db.query(Rol).filter(Rol.id_rol == id_rol).first()


@handle_db_exceptions
def get_roles(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Rol).order_by(Rol.nombre_rol).offset(skip).limit(limit).all()


@handle_db_exceptions
def create_rol(db: Session, rol_data: RolCreate) -> Rol:
    db_rol = Rol(**rol_data.dict())
    db.add(db_rol)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        if "nombre_rol" in str(e.orig):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nombre de rol ya existe",
            )
        raise
    db.refresh(db_rol)
    return db_rol


@handle_db_exceptions
def update_rol(db: Session, id_rol: int, rol_update: RolUpdate) -> Rol | None:
    db_rol: Rol = get_rol(db, id_rol)
    if not db_rol:
        return None

    for key, value in rol_update.dict(exclude_unset=True).items():
        setattr(db_rol, key, value)

    if "rol_activo" in rol_update.dict(exclude_unset=True):
        if not rol_update.rol_activo:
            db.query(Usuario).filter(Usuario.id_rol == id_rol).update(
                {"usuario_activo": False}
            )
        # TODO: Revisar esta logica con el equipo, aqui se pierde a los usuarios que anteriormente estaban desactivados
        # Revisar cuando se vea modulo historial
        else:
            db.query(Usuario).filter(Usuario.id_rol == id_rol).update(
                {"usuario_activo": True}
            )
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        if "nombre_rol" in str(e.orig):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nombre de rol ya existe",
            )
        raise
    db.refresh(db_rol)
    return db_rol


@handle_db_exceptions
def delete_rol(db: Session, id_rol: int) -> bool:
    db_rol = get_rol(db, id_rol)
    if not db_rol:
        return False

    if db_rol.usuarios:
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar el rol porque ya existen usuarios asignados a él.",
        )
    db.delete(db_rol)
    db.commit()
    return True
