import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# Mailtrap credentials
# TODO: Reemplazar con un servicio de email real en producción
# Usar variables de entorno
MAILTRAP_HOST = "sandbox.smtp.mailtrap.io"
MAILTRAP_PORT = 2525
MAILTRAP_USER = "019d38b0ef1480"
MAILTRAP_PASS = "56d9db479081a8"
FROM_EMAIL = "no-reply@gedefi.cl"


def send_email(to_email: str, subject: str, html_body: str):
    """Utility function to send HTML email using Mailtrap."""
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = FROM_EMAIL
    message["To"] = to_email

    part = MIMEText(html_body, "html")
    message.attach(part)

    try:
        with smtplib.SMTP(MAILTRAP_HOST, MAILTRAP_PORT) as server:
            server.login(MAILTRAP_USER, MAILTRAP_PASS)
            server.sendmail(FROM_EMAIL, to_email, message.as_string())
            print(f"Email sent to {to_email} (Mailtrap)")
    except Exception as e:
        print("Error sending email:", e)


def send_user_deactivated_email(email: str, nombre: str):
    subject = "Tu cuenta ha sido desactivada"
    html = f"""
    <html>
    <body>
        <p>Hola {nombre},</p>
        <p>Tu cuenta ha sido desactivada por el administrador del sistema.</p>
        <p>Si crees que se trata de un error, por favor contacta al soporte o a tu administrador.</p>
        <p>Saludos,</p>
        <p>Equipo GEDEFI</p>
    </body>
    </html>
    """
    send_email(email, subject, html)
