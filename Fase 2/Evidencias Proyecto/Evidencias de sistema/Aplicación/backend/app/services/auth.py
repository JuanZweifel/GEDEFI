import smtplib
import secrets
from fastapi import HTTPException, status
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from sqlalchemy import and_
from sqlalchemy.orm import Session, joinedload
from app.models import Usuario, DetalleUsuarioClub
from app.models.recuperacion_contrasena import RecuperacionContrasena
from app.security import (
    verify_password,
    create_access_token,
    get_password_hash,
    create_refresh_token,
    verify_refresh_token,
)
from app.utils.decorators import handle_db_exceptions

# Mailtrap credentials
# TODO: Reemplazar con un servicio de email real en producción
# Usar variables de entorno
MAILTRAP_HOST = "sandbox.smtp.mailtrap.io"
MAILTRAP_PORT = 2525
MAILTRAP_USER = "019d38b0ef1480"
MAILTRAP_PASS = "56d9db479081a8"
FROM_EMAIL = "no-reply@gedefi.cl"


@handle_db_exceptions
def authenticate_user(db: Session, email: str, password: str) -> Usuario | None:
    user: Usuario = (
        db.query(Usuario)
        .filter(and_(Usuario.email_usuario == email, Usuario.usuario_activo == True))
        .options(
            joinedload(Usuario.detalles_usuario_club).joinedload(
                DetalleUsuarioClub.club
            )
        )
        .first()
    )

    if not user or not verify_password(password, user.pass_usuario):
        return None

    if not user.usuario_activo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La cuenta se encuentra deshabilitada",
        )

    return user


@handle_db_exceptions
def login_for_access_token(db: Session, email: str, password: str) -> dict | None:
    user = authenticate_user(db, email, password)
    if not user:
        return None

    active_club = None
    for detalle in user.detalles_usuario_club:
        if not detalle.fecha_fin or detalle.fecha_fin > datetime.now():
            active_club = detalle.club
            break

    token_data = {
        "rut": user.rut_usuario,
        "email": user.email_usuario,
        "rol": user.rol.nombre_rol,
        "id_club": active_club.id_club if active_club else None,
        "club_nombre": active_club.nombre_club if active_club else None,
        "nombre": f"{user.nombre_usuario} {user.apellido_usuario}",
        "asociacion": user.asociacion,
    }

    access_token = create_access_token(data=token_data)
    refresh_token = create_refresh_token(rut=user.rut_usuario)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@handle_db_exceptions
def refresh_access_token(refresh_token: str, db: Session):
    payload = verify_refresh_token(refresh_token)

    rut_usuario = payload.get("rut")
    if not rut_usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido o sin usuario",
        )

    user = (
        db.query(Usuario)
        .filter(
            and_(Usuario.rut_usuario == rut_usuario, Usuario.usuario_activo == True)
        )
        .first()
    )
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    active_club = None
    for detalle in user.detalles_usuario_club:
        if not detalle.fecha_fin or detalle.fecha_fin > datetime.now():
            active_club = detalle.club
            break

    new_token_data = {
        "rut": user.rut_usuario,
        "email": user.email_usuario,
        "rol": user.rol.nombre_rol,
        "id_club": active_club.id_club if active_club else None,
        "club_nombre": active_club.nombre_club if active_club else None,
        "nombre": f"{user.nombre_usuario} {user.apellido_usuario}",
        "asociacion": user.asociacion,
    }

    new_access_token = create_access_token(data=new_token_data)

    return {"access_token": new_access_token, "token_type": "bearer"}


@handle_db_exceptions
def send_recovery_email(db: Session, email: str) -> None:
    user: Usuario = db.query(Usuario).filter(Usuario.email_usuario == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if not user.usuario_activo:
        raise HTTPException(status_code=400, detail="Usuario inactivo")

    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)

    recovery_entry = RecuperacionContrasena(
        rut_usuario=user.rut_usuario, token=token, expires_at=expires_at
    )
    try:
        db.add(recovery_entry)
        db.commit()
    except Exception as e:
        db.rollback()
        return

    recovery_link = f"http://localhost:3000/reset-password?token={token}"

    message = MIMEMultipart("alternative")
    message["Subject"] = "Recuperación de Contraseña"
    message["From"] = FROM_EMAIL
    message["To"] = email

    html = f"""
    <html>
    <body>
        <p>Hola,</p>
        <p>Para recuperar tu contraseña, haz clic en el siguiente enlace:</p>
        <a href="{recovery_link}">Recuperar Contraseña</a>
        <p>Si no solicitaste este cambio, ignora este mensaje.</p>
    </body>
    </html>
    """
    part = MIMEText(html, "html")
    message.attach(part)

    try:
        with smtplib.SMTP(MAILTRAP_HOST, MAILTRAP_PORT) as server:
            server.login(MAILTRAP_USER, MAILTRAP_PASS)
            server.sendmail(FROM_EMAIL, email, message.as_string())
    except Exception as e:
        print(e)


def reset_user_password(db: Session, token: str, new_password: str):
    token_entry = (
        db.query(RecuperacionContrasena)
        .filter(RecuperacionContrasena.token == token)
        .first()
    )

    if not token_entry or token_entry.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Token inválido o expirado"
        )

    user = (
        db.query(Usuario).filter(Usuario.rut_usuario == token_entry.rut_usuario).first()
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado"
        )

    user.pass_usuario = get_password_hash(new_password)
    db.delete(token_entry)
    db.commit()

    return {"message": "Contraseña restablecida con éxito"}
