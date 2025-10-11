from sqlalchemy.orm import Session
from app.models import Jugador
from app.schemas import JugadorCreate, JugadorUpdate
from fastapi import HTTPException


def get_jugador(db: Session, rut_jugador: str) -> Jugador | None:
    return db.query(Jugador).filter(Jugador.rut_jugador == rut_jugador).first()


def get_jugadores(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Jugador).offset(skip).limit(limit).all()


def create_jugador(db: Session, jugador: JugadorCreate) -> Jugador:
    # Verificar si el jugador ya existe
    db_jugador = get_jugador(db, jugador.rut_jugador)
    if db_jugador:
        # Lanzar error HTTP 409 (conflicto)
        raise HTTPException(
            status_code=409,
            detail="El RUT ingresado ya se encuentra registrado"
        )
    
    # Crear jugador
    nuevo_jugador = Jugador(**jugador.dict())
    db.add(nuevo_jugador)
    db.commit()
    db.refresh(nuevo_jugador)
    return nuevo_jugador


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