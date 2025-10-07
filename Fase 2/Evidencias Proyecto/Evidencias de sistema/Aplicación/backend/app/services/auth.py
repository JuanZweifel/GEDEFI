import smtplib
import secrets
from fastapi import HTTPException, status
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.usuario import Usuario
from app.models.recuperacion_contrasena import RecuperacionContrasena
from app.security import verify_password, create_access_token, get_password_hash

# Mailtrap credentials
# TODO: Reemplazar con un servicio de email real en producción
# Usar variables de entorno
MAILTRAP_HOST = "sandbox.smtp.mailtrap.io"
MAILTRAP_PORT = 2525
MAILTRAP_USER = "019d38b0ef1480"
MAILTRAP_PASS = "56d9db479081a8"
FROM_EMAIL = "no-reply@gedefi.cl"


def authenticate_user(db: Session, email: str, password: str) -> Usuario | None:
    user = db.query(Usuario).filter(Usuario.email_usuario == email).first()
    if not user or not verify_password(password, user.pass_usuario):
        return None
    return user


def login_for_access_token(db: Session, email: str, password: str) -> dict | None:
    user = authenticate_user(db, email, password)
    if not user:
        return None

    token_data = {
        "rut": user.rut_usuario,
        "email": user.email_usuario,
        "rol": user.rol.nombre_rol,
        "nombre": f"{user.nombre_usuario} {user.apellido_usuario}",
    }

    access_token_expires = timedelta(minutes=60)
    token = create_access_token(data=token_data, expires_delta=access_token_expires)

    return {"access_token": token, "token_type": "bearer"}


def send_recovery_email(db: Session, email: str) -> None:
    user = db.query(Usuario).filter(Usuario.email_usuario == email).first()
    if not user:
        return

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
        print("Error saving recovery token:", e)
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
            print(f"Recovery email sent to {email} (Mailtrap)")
    except Exception as e:
        print("Error sending recovery email:", e)


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
