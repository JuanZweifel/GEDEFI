from sqlalchemy.orm import Session
from app.models import CuentaUsuario
from app.schemas import CuentaUsuarioCreate, CuentaUsuarioUpdate


def get_cuenta_usuario(db: Session, correo_usu: str) -> CuentaUsuario | None:
    return (
        db.query(CuentaUsuario).filter(CuentaUsuario.correo_usu == correo_usu).first()
    )


def get_cuentas_usuario(db: Session, skip: int = 0, limit: int = 100):
    return db.query(CuentaUsuario).offset(skip).limit(limit).all()


def create_cuenta_usuario(
    db: Session, cuenta_usuario: CuentaUsuarioCreate
) -> CuentaUsuario:
    db_cuenta_usuario = CuentaUsuario(**cuenta_usuario.dict())
    db.add(db_cuenta_usuario)
    db.commit()
    db.refresh(db_cuenta_usuario)
    return db_cuenta_usuario


def update_cuenta_usuario(
    db: Session, correo_usu: str, cuenta_usuario_update: CuentaUsuarioUpdate
) -> CuentaUsuario | None:
    db_cuenta_usuario = get_cuenta_usuario(db, correo_usu)
    if not db_cuenta_usuario:
        return None
    for key, value in cuenta_usuario_update.dict(exclude_unset=True).items():
        setattr(db_cuenta_usuario, key, value)
    db.commit()
    db.refresh(db_cuenta_usuario)
    return db_cuenta_usuario


def delete_cuenta_usuario(db: Session, correo_usu: str) -> bool:
    db_cuenta_usuario = get_cuenta_usuario(db, correo_usu)
    if not db_cuenta_usuario:
        return False
    db.delete(db_cuenta_usuario)
    db.commit()
    return True
