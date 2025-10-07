from sqlalchemy.orm import Session, selectinload
from app.models import Serie, Jugador, FichaJugador
from app.schemas import SerieCreate, SerieRead, JugadorList, JugadorRead
from sqlalchemy import and_
from sqlalchemy.exc import NoResultFound, SQLAlchemyError
from .club import get_club

from fastapi import HTTPException


def get_serie(db: Session, id_serie: int) -> Serie | None:
    return db.query(Serie).filter(Serie.id_serie == id_serie).first()

def get_series(db: Session, skip: int = 0, limit: int = 100) -> list[SerieRead]:
    # Traemos las series
    series = db.query(Serie).offset(skip).limit(limit).all()
    
    result = []
    for s in series:
        # Traemos los jugadores asociados a la serie usando la tabla intermedia
        jugadores = (
            db.query(Jugador)
            .join(FichaJugador, FichaJugador.rut_jugador == Jugador.rut_jugador)
            .filter(FichaJugador.id_serie == s.id_serie)
            .all()
        )
        
        jugadores_read = [JugadorRead.model_validate(j) for j in jugadores]

        serie_read = SerieRead(
            id_serie=s.id_serie,
            nombre_serie=s.nombre_serie,
            id_club=s.id_club,
            nombre_club=s.club.nombre_club,  # asumiendo Serie tiene relación con club
            serie_activa=s.serie_activa,
            jugadores=jugadores_read,
            cantidad_jugadores=len(jugadores_read), # <-- aquí agregamos la cantidad
            fecha_creacion = s.fecha_creacion.strftime("%Y-%m-%d"),
            fecha_modificacion = s.fecha_modificacion.strftime("%Y-%m-%d")
        )
        result.append(serie_read)
    
    return result


def create_serie(db: Session, serie: SerieCreate) -> Serie:
    db_serie = Serie(**serie.dict())
    db.add(db_serie)
    db.commit()
    db.refresh(db_serie)
    return db_serie


def delete_serie(db: Session, id_serie: int) -> bool:
    db_serie = get_serie(db, id_serie)
    if not db_serie:
        return False
    db.delete(db_serie)
    db.commit()
    return True


def get_players_serie(db: Session, id_serie: int) -> JugadorList:
    try:
        db_serie = get_serie(db, id_serie=id_serie)
        if db_serie:
            jugadores = (
                db.query(Jugador)
                .join(FichaJugador, FichaJugador.rut_jugador == Jugador.rut_jugador)
                .filter(FichaJugador.id_serie == db_serie.id_serie)
                .all()
            )
            jugadores_pydantic = [JugadorRead.model_validate(j) for j in jugadores]
        return JugadorList(jugadores=jugadores_pydantic)
    except NoResultFound as e:
        raise HTTPException(
            status_code=400, detail={"details": "Serie no encontrada"}
        ) from e
