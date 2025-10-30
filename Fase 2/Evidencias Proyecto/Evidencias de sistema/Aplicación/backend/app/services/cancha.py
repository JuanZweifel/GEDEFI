from sqlalchemy.orm import Session
from app.models import Cancha
from app.schemas import CanchaCreate, CanchaUpdate
from app.utils.decorators import handle_audit, handle_db_exceptions

@handle_db_exceptions
def get_cancha(db: Session, cancha_id: int) -> Cancha | None:
    return db.query(Cancha).filter(Cancha.id_cancha == cancha_id).first()

@handle_db_exceptions
def get_canchas(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Cancha).offset(skip).limit(limit).all()

@handle_audit("CREATE", "Cancha")
def create_cancha(db: Session, cancha: CanchaCreate) -> Cancha:
    db_cancha = Cancha(**cancha.dict())
    db.add(db_cancha)
    db.commit()
    db.refresh(db_cancha)
    return db_cancha

@handle_audit("UPDATE", "Cancha")
def update_cancha(db: Session, cancha_id: int, cancha_update: CanchaUpdate) -> Cancha | None:
    db_cancha = get_cancha(db, cancha_id)
    if not db_cancha:
        return None
    for key, value in cancha_update.dict(exclude_unset=True).items():
        setattr(db_cancha, key, value)
    db.commit()
    db.refresh(db_cancha)
    return db_cancha

@handle_audit("DELETE", "Cancha")
def delete_cancha(db: Session, cancha_id: int) -> int:
    db_cancha = get_cancha(db, cancha_id)
    if not db_cancha:
        return False
    db.delete(db_cancha)
    db.commit()
    return cancha_id