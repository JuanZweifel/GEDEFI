from sqlalchemy.orm import Session
from app.models import FichaJugador
from app.schemas import FichaJugadorCreate, FichaJugadorUpdate


def get_ficha_jugador(db: Session, rut_jugador: str, id_serie: int) -> FichaJugador | None:
    return db.query(FichaJugador).filter(
        FichaJugador.rut_jugador == rut_jugador,
        FichaJugador.id_serie == id_serie
    ).first()


def get_fichas_jugador(db: Session, skip: int = 0, limit: int = 100):
    return db.query(FichaJugador).offset(skip).limit(limit).all()


def create_ficha_jugador(db: Session, ficha: FichaJugadorCreate) -> FichaJugador:
    db_ficha = FichaJugador(**ficha.dict())
    db.add(db_ficha)
    db.commit()
    db.refresh(db_ficha)
    return db_ficha


def update_ficha_jugador(
    db: Session, rut_jugador: str, id_serie: int, ficha_update: FichaJugadorUpdate
) -> FichaJugador | None:
    db_ficha = get_ficha_jugador(db, rut_jugador, id_serie)
    if not db_ficha:
        return None
    for key, value in ficha_update.dict(exclude_unset=True).items():
        setattr(db_ficha, key, value)
    db.commit()
    db.refresh(db_ficha)
    return db_ficha


def delete_ficha_jugador(db: Session, rut_jugador: str, id_serie: int) -> bool:
    db_ficha = get_ficha_jugador(db, rut_jugador, id_serie)
    if not db_ficha:
        return False
    db.delete(db_ficha)
    db.commit()
    return True