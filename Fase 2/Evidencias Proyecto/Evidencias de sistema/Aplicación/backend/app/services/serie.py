from sqlalchemy.orm import Session, selectinload
from app.models import Serie, Jugador, FichaJugador
from app.schemas import SerieCreate, SerieRead, JugadorList, JugadorRead, SerieWithDetails
from sqlalchemy import and_
from sqlalchemy.exc import IntegrityError, NoResultFound, SQLAlchemyError, OperationalError, DisconnectionError
import psycopg2
from .club import get_club

from fastapi import HTTPException


def get_serie(db: Session, id_serie: int) -> Serie | None:
    return db.query(Serie).filter(Serie.id_serie == id_serie).first()

def get_series_with_details(db: Session, skip: int = 0, limit: int = 100) -> list[SerieWithDetails]:
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

        serie_read = SerieWithDetails(
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

def get_series(db:Session):
    return db.query(Serie).all()


def create_serie(db: Session, serie: SerieCreate) -> bool:
    try:
        serie_exist = db.query(Serie).filter(Serie.id_club == serie.id_club and Serie.nombre_serie == serie.nombre_serie)
        if serie_exist:
            raise HTTPException(status_code=400, detail=f"El club ya tiene una serie {serie.nombre_serie} asociada.")
        db_serie = Serie(**serie.dict())
        db.add(db_serie)
        db.commit()
        db.refresh(db_serie)
        return True
    except IntegrityError as e:
        db.rollback()
        if isinstance(e.orig, psycopg2.errors.UniqueViolation):
            '''detail = (
                "El RUT ingresado esta asociado a otro club." if "CLUB_rut_club_key" in str(e.orig) else 
                "El correo ingresado ya esta asociado a un club." if "CLUB_email_club_key" in str(e.orig) else 
                "El nombre ingresado se encuentrado asociado a otro club" if "CLUB_nombre_club_key" in str(e.orig)
                else e.orig
            )'''
            raise HTTPException(
                status_code=400, detail=e.orig
            ) from e
        else:
            raise HTTPException(
                status_code=400, detail=f"No se encontro un club asociado al ID: {serie.id_club}"
            ) from e
    except (DisconnectionError, OperationalError) as e: 
        raise HTTPException(status_code=500, detail="Problemas de conexión con la base de datos.") from e
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error interno del servidor") from e
    except HTTPException as e:
        raise e from e


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
