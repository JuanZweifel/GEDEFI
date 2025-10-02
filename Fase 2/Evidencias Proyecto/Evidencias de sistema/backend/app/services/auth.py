from sqlalchemy.orm import Session
from app.models.usuario import Usuario
from app.security import verify_password, create_access_token
from datetime import timedelta


def authenticate_user(db: Session, email: str, password: str):
    user = db.query(Usuario).filter(Usuario.email_usuario == email).first()
    if not user or not verify_password(password, user.pass_usuario):
        return None
    return user


def login_for_access_token(db: Session, email: str, password: str):
    user = authenticate_user(db, email, password)
    if not user:
        return None

    token_data = {
        "rut": user.rut_usuario,
        "email": user.email_usuario,
        "rol": user.rol.nombre_rol,
    }

    access_token_expires = timedelta(minutes=60)
    token = create_access_token(data=token_data, expires_delta=access_token_expires)

    return {"access_token": token, "token_type": "bearer"}
