from sqlalchemy.orm import Session
from app.models import Jugador
from app.schemas import JugadorCreate, JugadorUpdate


def get_jugador(db: Session, rut_jugador: str) -> Jugador | None:
    return db.query(Jugador).filter(Jugador.rut_jugador == rut_jugador).first()


def get_jugadores(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Jugador).offset(skip).limit(limit).all()


def create_jugador(db: Session, jugador: JugadorCreate) -> Jugador:
    db_jugador = Jugador(**jugador.dict())
    db.add(db_jugador)
    db.commit()
    db.refresh(db_jugador)
    return db_jugador


def update_jugador(
    db: Session, rut_jugador: str, jugador_update: JugadorUpdate
) -> Jugador | None:
    db_jugador = get_jugador(db, rut_jugador)
    if not db_jugador:
        return None
    for key, value in jugador_update.dict(exclude_unset=True).items():
        setattr(db_jugador, key, value)
    db.commit()
    db.refresh(db_jugador)
    return db_jugador


def delete_jugador(db: Session, rut_jugador: str) -> bool:
    db_jugador = get_jugador(db, rut_jugador)
    if not db_jugador:
        return False
    db.delete(db_jugador)
    db.commit()
    return True