from sqlalchemy.orm import Session
from app.models import Usuario, DetalleUsuarioClub
from app.schemas import UsuarioCreate, UsuarioUpdate
from app.security import get_password_hash
from fastapi import HTTPException


def get_usuario(db: Session, rut_usu: str) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.rut_usuario == rut_usu).first()


def get_usuarios(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Usuario).offset(skip).limit(limit).all()


def create_usuario(db: Session, usuario: UsuarioCreate) -> Usuario:
    print("Password raw:", usuario.pass_usuario)
    print("Length:", len(usuario.pass_usuario))
    hashed_password = get_password_hash(usuario.pass_usuario)
    if(not usuario.admin):
        if(usuario.id_club == 0):
            raise HTTPException(status_code=400, detail="Debe asociar un club a un usuario NO administrativo.")
        db_detalle = DetalleUsuarioClub(rut_usuario=usuario.rut_usuario, id_club=usuario.id_club)
    db_usuario = Usuario(
        **usuario.dict(exclude={"admin", "id_club"}exclude={"pass_usuario"}), pass_usuario=hashed_password
    )
    db_usuario.detalles_usuario_club.append(db_detalle) if not usuario.admin else None
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario


def update_usuario(
    db: Session, rut_usu: str, usuario_update: UsuarioUpdate
) -> Usuario | None:
    db_usuario = get_usuario(db, rut_usu)
    if not db_usuario:
        return None
    for key, value in usuario_update.dict(exclude_unset=True).items():
        setattr(db_usuario, key, value)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario


def delete_usuario(db: Session, rut_usu: str) -> bool:
    db_usuario = get_usuario(db, rut_usu)
    if not db_usuario:
        return False
    db.delete(db_usuario)
    db.commit()
    return True
