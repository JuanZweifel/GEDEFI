from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Usuario, Rol
from app.services.correo import send_email_bcc
from app.schemas import ComunicadoRequest

router = APIRouter(prefix="/correos", tags=["Correos"])


@router.post("/send_comunicado")
def send_comunicado(payload: ComunicadoRequest, db: Session = Depends(get_db)):
    try:
        if payload.destinatarios == "all":
            users = db.query(Usuario).all()
        else:
            users = (
                db.query(Usuario)
                .join(Rol, Usuario.id_rol == Rol.id_rol)
                .filter(Rol.nombre_rol.in_(payload.destinatarios))
                .all()
            )

        if not users:
            raise HTTPException(status_code=404, detail="No se encontraron usuarios")

        emails = [user.email_usuario for user in users]

        html = f"""
        <body>
            <p>{payload.cuerpo}</p>
            <p>Saludos,</p>
            <p>Equipo GEDEFI</p>
        </body>
        """

        send_email_bcc(emails, payload.asunto, html)

        return {"status": "ok", "sent": len(emails)}

    except Exception as e:
        print("Error sending comunicado:", e)
        raise HTTPException(status_code=500, detail="Error al enviar comunicado")
    finally:
        db.close()
