from sqlalchemy.orm import Session
from app.models import Usuario
from app.schemas import UsuarioCreate, UsuarioUpdate


def get_usuario(db: Session, rut_usu: str) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.rut_usu == rut_usu).first()


def get_usuarios(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Usuario).offset(skip).limit(limit).all()


def create_usuario(db: Session, usuario: UsuarioCreate) -> Usuario:
    db_usuario = Usuario(**usuario.dict())
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
