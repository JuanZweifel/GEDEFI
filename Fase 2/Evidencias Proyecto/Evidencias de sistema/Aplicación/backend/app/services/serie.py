from sqlalchemy.orm import Session
from app.models import Serie, Club, Jugador, FichaJugador
from app.schemas import SerieCreate, SerieWithDetails, JugadorRead, SerieUpdate
from sqlalchemy import and_
from sqlalchemy.exc import IntegrityError, NoResultFound, SQLAlchemyError, OperationalError, DisconnectionError
import psycopg2
from .club import get_club

from fastapi import HTTPException


def get_serie(db: Session, id_serie: int) -> Serie | None:
    return db.query(Serie).filter(Serie.id_serie == id_serie).first()

def get_series(db:Session):
    return db.query(Serie).all()


def create_serie(db: Session, serie: SerieCreate):
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


def delete_serie(db: Session, id_serie: int):
    try:
        db_serie = get_serie(db, id_serie)
        if not db_serie:
            return False
        db.delete(db_serie)
        db.commit()
        return True
    except AssertionError as e:
        raise HTTPException(
            status_code=500,
            detail="No puedes borrar una serie que tenga registros asociados."
        ) from e
    except IntegrityError as e:
        if isinstance(e.orig, psycopg2.errors.NotNullViolation):
            raise HTTPException(
                status_code=500,
                detail="No puedes borrar una serie que tenga registros asociados.",
            ) from e
        else:
            raise HTTPException(status_code=500, detail={"error": e.orig.args}) from e
    except (DisconnectionError, OperationalError) as e:
        raise HTTPException(
            status_code=500, detail="Problemas de conexión con la base de datos."
        ) from e
    except (SQLAlchemyError) as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=(
                "Error interno del servidor"
            ),
        ) from e


def get_series_with_details(db: Session) -> list[SerieWithDetails]:
    try:
        # Traemos todas las series con su club asociado
        db_series = db.query(Serie).join(Club).all()
        
        series_with_details = []

        for serie in db_series:
            # Contamos los jugadores asociados a esta serie
            cantidad_jugadores = (
                db.query(Jugador)
                .join(FichaJugador)
                .filter(FichaJugador.id_serie == serie.id_serie)
                .count()
            )

            # Obtenemos los jugadores con sus datos básicos
            db_jugadores = (
                db.query(Jugador)
                .join(FichaJugador)
                .filter(FichaJugador.id_serie == serie.id_serie)
                .all()
            )

            jugadores = [JugadorRead.model_validate(j) for j in db_jugadores]

            # Creamos el objeto SerieWithDetails para esta serie
            serie_detail = SerieWithDetails(
                id_serie=serie.id_serie,
                nombre_serie=serie.nombre_serie,
                id_club=serie.id_club,
                serie_activa=serie.serie_activa,
                fecha_creacion=serie.fecha_creacion,
                fecha_modificacion=serie.fecha_modificacion,
                nombre_club=serie.club.nombre_club,
                cantidad_jugadores=cantidad_jugadores,
                jugadores=jugadores,
            )

            series_with_details.append(serie_detail)

        return series_with_details
    except NoResultFound:
        raise HTTPException(status_code=404, detail="Serie no encontrada.")
    except (DisconnectionError, OperationalError):
        raise HTTPException(
            status_code=500, detail="Problemas de conexión con la base de datos."
        )
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=str(e))

def update_state_serie(db: Session, id_serie: int, serieUpdate: SerieUpdate):
    try:
        db_serie = db.query(Serie).filter(Serie.id_serie == id_serie).first()
        if not db_serie:
            raise HTTPException(status_code=404, detail=f"No se encontro la serie asociada al ID: {id_serie}")
        db_serie.serie_activa = serieUpdate.state
        db.commit()
        db.refresh(db_serie)
        return True
    except (DisconnectionError, OperationalError) as e:
        raise HTTPException(
            status_code=500, detail="Problemas de conexión con la base de datos."
        ) from e
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error interno del servidor") from e