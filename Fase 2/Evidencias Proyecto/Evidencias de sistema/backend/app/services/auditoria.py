from sqlalchemy.orm import Session
from app.models import auditoria
from app.schemas import AuditoriaCreate, AuditoriaUpdate
from datetime import datetime, timezone


def get_auditoria(db: Session, id_auditoria: int) -> auditoria.Auditoria | None:
    return (
        db.query(auditoria.Auditoria)
        .filter(auditoria.Auditoria.id_auditoria == id_auditoria)
        .first()
    )


def get_auditorias(db: Session, skip: int = 0, limit: int = 100):
    return db.query(auditoria.Auditoria).offset(skip).limit(limit).all()


# Helper para crear una auditoria
def create_auditoria(
    db: Session,
    recurso: str,
    id_recurso: int,
    accion: str,
    usuario: str,
    descripcion: str | None = None,
):
    auditoria_data = AuditoriaCreate(
        recurso=recurso,
        id_recurso=id_recurso,
        accion_realizada=accion,
        usuario=usuario,
        descripcion=descripcion,
        fecha_cambio=datetime.now(timezone.utc),
    )
    return auditoria.create_auditoria(db, auditoria_data)
