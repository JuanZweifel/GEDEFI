from sqlalchemy.orm import Session
from app.models import FichaJugador
from app.schemas import FichaJugadorCreate, FichaJugadorUpdate

def create_ficha_jugador(db: Session, ficha_jugador: FichaJugadorCreate):
    db_ficha_jugador = FichaJugador(**ficha_jugador.dict())
    db.add(db_ficha_jugador)
    db.commit()
    db.refresh(db_ficha_jugador)
    return db_ficha_jugador

def get_ficha_jugador(db: Session, rut_jugador: str):
    return db.query(FichaJugador).filter(FichaJugador.rut_jugador == rut_jugador).first()

def get_fichas_jugadores(db: Session, skip: int = 0, limit: int = 100):
    return db.query(FichaJugador).offset(skip).limit(limit).all()

def update_ficha_jugador(db: Session, rut_jugador: str, ficha_jugador: FichaJugadorUpdate):
    db_ficha_jugador = db.query(FichaJugador).filter(FichaJugador.rut_jugador == rut_jugador).first()
    if db_ficha_jugador:
        for key, value in ficha_jugador.dict(exclude_unset=True).items():
            setattr(db_ficha_jugador, key, value)
        db.commit()
        db.refresh(db_ficha_jugador)
    return db_ficha_jugador

def delete_ficha_jugador(db: Session, rut_jugador: str):
    db_ficha_jugador = db.query(FichaJugador).filter(FichaJugador.rut_jugador == rut_jugador).first()
    if db_ficha_jugador:
        db.delete(db_ficha_jugador)
        db.commit()
    return db_ficha_jugador