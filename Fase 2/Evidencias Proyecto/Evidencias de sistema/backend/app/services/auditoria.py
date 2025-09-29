from sqlalchemy.orm import Session
from app.models import auditoria
from app.schemas import AuditoriaCreate, AuditoriaUpdate


def get_auditoria(db: Session, id_auditoria: int) -> auditoria.Auditoria | None:
    return (
        db.query(auditoria.Auditoria)
        .filter(auditoria.Auditoria.id_auditoria == id_auditoria)
        .first()
    )


def get_auditorias(db: Session, skip: int = 0, limit: int = 100):
    return db.query(auditoria.Auditoria).offset(skip).limit(limit).all()


def create_auditoria(
    db: Session, auditoria_data: AuditoriaCreate
) -> auditoria.Auditoria:
    db_auditoria = auditoria.Auditoria(**auditoria_data.dict())
    db.add(db_auditoria)
    db.commit()
    db.refresh(db_auditoria)
    return db_auditoria
