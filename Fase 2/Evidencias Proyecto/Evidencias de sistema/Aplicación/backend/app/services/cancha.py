from sqlalchemy.orm import Session
from app.models import Cancha
from app.schemas import CanchaCreate, CanchaUpdate
from fastapi import HTTPException
from app.utils.decorators import handle_audit, handle_db_exceptions
from fastapi import HTTPException


@handle_db_exceptions
def get_cancha(db: Session, cancha_id: int, current_user: dict) -> Cancha | None:
    return db.query(Cancha).filter(Cancha.id_cancha == cancha_id).first()


@handle_db_exceptions
def get_canchas(db: Session, current_user: dict, skip: int = 0, limit: int = 100):
    return db.query(Cancha).offset(skip).limit(limit).all()


@handle_audit("CREATE", "CANCHA")
def create_cancha(db: Session, cancha: CanchaCreate, current_user: dict) -> Cancha:
    db_cancha = Cancha(**cancha.dict())
    db.add(db_cancha)
    db.commit()
    db.refresh(db_cancha)
    return db_cancha


@handle_audit("UPDATE", "CANCHA")
def update_cancha(
    db: Session, cancha_id: int, cancha_update: CanchaUpdate, current_user: dict
) -> Cancha | None:
    db_cancha = get_cancha(db, cancha_id)
    if not db_cancha:
        return None
    for key, value in cancha_update.dict(exclude_unset=True).items():
        setattr(db_cancha, key, value)
    db.commit()
    db.refresh(db_cancha)
    return db_cancha


@handle_audit("DELETE", "CANCHA")
def delete_cancha(db: Session, cancha_id: int, current_user: dict) -> str:
    db_cancha = db.get(Cancha, cancha_id)
    if not db_cancha:
        raise HTTPException(status_code=404, detail="Cancha no encontrada")

    has_related_records = bool(db_cancha.partido or db_cancha.entrenamientos)

    if has_related_records:
        db_cancha.cancha_activa = False
        db.commit()
        db.refresh(db_cancha)
        return (
            "La cancha tenía registros asociados, se desactivó en lugar de eliminarse."
        )
    else:
        db.delete(db_cancha)
        db.commit()
        return "Cancha eliminada correctamente."


def reactivate_cancha(db: Session, cancha_id: int, current_user: dict) -> Cancha | None:
    db_cancha = get_cancha(db, cancha_id)
    if not db_cancha:
        return None
    if db_cancha.cancha_activa:
        raise HTTPException(status_code=400, detail="La cancha ya está activa")
    db_cancha.cancha_activa = True
    db.commit()
    db.refresh(db_cancha)
    return db_cancha
