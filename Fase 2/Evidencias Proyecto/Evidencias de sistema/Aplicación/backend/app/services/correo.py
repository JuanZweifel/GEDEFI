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


def build_email_template(body_content: str):
    """
    Genera una plantilla HTML estándar para los correos del sistema GEDEFI.

    Parámetros:
        body_content (str): Contenido HTML específico del mensaje.

    Retorna:
        str: HTML completo listo para enviar.
    """
    return f"""
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                background-color: #f7f7f7;
                margin: 0;
                padding: 0;
            }}
            .container {{
                background-color: #ffffff;
                max-width: 600px;
                margin: 20px auto;
                border-radius: 10px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                overflow: hidden;
            }}
            .header {{
                background-color: #004aad;
                color: white;
                padding: 16px;
                text-align: center;
            }}
            .content {{
                padding: 24px;
                color: #333333;
                line-height: 1.5;
            }}
            .footer {{
                background-color: #f1f1f1;
                text-align: center;
                padding: 12px;
                font-size: 12px;
                color: #888888;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="content">
                {body_content}
            </div>
            <div class="footer">
                © 2025 GEDEFI — Todos los derechos reservados.
            </div>
        </div>
    </body>
    </html>
    """


def send_email(to_email: str, subject: str, body_content: str):
    """
    Envía un correo electrónico HTML a un único destinatario usando la plantilla estándar GEDEFI.

    Parámetros:
        to_email (str): Dirección de correo del destinatario.
        subject (str): Asunto del correo.
        body_content (str): Contenido específico del mensaje (solo el cuerpo, sin formato HTML).

    Qué hace:
        - Aplica la plantilla HTML estándar de GEDEFI.
        - Crea un mensaje MIME en formato HTML.
        - Envía el correo a través del servidor SMTP configurado.
    """
    # Usa el título del asunto si no se entrega explícitamente
    html_body = build_email_template(body_content)

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
            print(f"Email sent to {to_email}")
    except Exception as e:
        print("Error sending email:", e)


def send_email_bcc(to_emails, subject: str, body_content: str):
    """
    Envía un correo electrónico HTML a múltiples destinatarios ocultos (BCC)
    usando la plantilla estándar del sistema GEDEFI.

    Parámetros:
        to_emails (str | list[str]): Uno o varios correos electrónicos de los destinatarios.
        subject (str): Asunto del correo.
        body_content (str): Contenido específico del mensaje (solo el cuerpo, sin formato HTML).

    Qué hace:
        - Aplica la plantilla HTML estándar de GEDEFI.
        - Crea un mensaje MIME en formato HTML.
        - Si se pasa un solo string como destinatario, lo convierte a lista.
        - Envía el correo a través del servidor SMTP configurado sin mostrar las direcciones.
    """
    if isinstance(to_emails, str):
        to_emails = [to_emails]

    # Usa el asunto como título si no se especifica otro
    html_body = build_email_template(body_content)

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = FROM_EMAIL
    message["To"] = "Destinatarios ocultos"

    part = MIMEText(html_body, "html")
    message.attach(part)

    try:
        with smtplib.SMTP(MAILTRAP_HOST, MAILTRAP_PORT) as server:
            server.login(MAILTRAP_USER, MAILTRAP_PASS)
            server.sendmail(FROM_EMAIL, to_emails, message.as_string())
            print(f"Email sent to {len(to_emails)} recipients via BCC (Mailtrap)")
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
