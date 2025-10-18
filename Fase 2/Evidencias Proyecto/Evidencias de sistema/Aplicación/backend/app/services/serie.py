from sqlalchemy.orm import Session
from app.models import Serie, Club, Jugador, FichaJugador, DetalleUsuarioClub
from app.schemas import SerieCreate, SerieWithDetails, JugadorRead, SerieUpdate
from sqlalchemy import and_, or_
from sqlalchemy.exc import IntegrityError, NoResultFound, SQLAlchemyError, OperationalError, DisconnectionError
import psycopg2
from .club import get_club
from app.utils.decorators import handle_db_exceptions
from fastapi import HTTPException, status
from datetime import date


@handle_db_exceptions
def get_serie(db: Session, id_serie: int) -> Serie | None:
    """
    Obtiene un registro de `Serie` desde la base de datos utilizando su identificador único.

    Esta función realiza una consulta a la base de datos para buscar una instancia del modelo
    `Serie` que coincida con el `id_serie` proporcionado.
    Las excepciones de base de datos son manejadas automáticamente por el decorador
    `handle_db_exceptions`.

    Parámetros
    ----------
    db : Session
        Sesión de base de datos de SQLAlchemy.
    id_serie : int
        Identificador único de la serie a consultar.

    Retorna
    -------
    Serie o None
        Instancia del modelo `Serie` si se encuentra, de lo contrario `None`.

    Lanza
    -----
    HTTPException
        Si ocurre un error relacionado con la base de datos, manejado por `handle_db_exceptions`.
    """
    return db.query(Serie).filter(Serie.id_serie == id_serie).first()


@handle_db_exceptions
def delete_serie(db: Session, id_serie: int, current_user: dict):
    """
    Elimina una serie existente de la base de datos.

    Esta función busca una instancia del modelo `Serie` según el identificador proporcionado
    y la elimina de la base de datos.  
    Las excepciones de base de datos son manejadas automáticamente por el decorador
    `handle_db_exceptions`.

    Parámetros
    ----------
    db : Session
        Sesión de base de datos de SQLAlchemy.
    id_serie : int
        Identificador único de la serie a eliminar.

    Retorna
    -------
    bool
        `True` si la serie fue eliminada correctamente, `False` si no se encontró.

    Lanza
    -----
    HTTPException
        Si se intenta eliminar una serie con registros asociados o si ocurre un error de integridad.
    """
    try:
        if not current_user["admin"]: raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso de borrar series")
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

@handle_db_exceptions
def get_series_with_details(db: Session, current_user: dict) -> list[SerieWithDetails]:
    """
    Obtiene todas las series junto con sus detalles asociados (club y jugadores).

    Esta función consulta la base de datos para obtener todas las series junto con la
    información del club al que pertenecen y la lista de jugadores asociados.  
    Construye objetos del tipo `SerieWithDetails` con los datos obtenidos.
    Las excepciones de base de datos son manejadas automáticamente por el decorador
    `handle_db_exceptions`.

    Parámetros
    ----------
    db : Session
        Sesión de base de datos de SQLAlchemy.

    Retorna
    -------
    list[SerieWithDetails]
        Lista de instancias del schema `SerieWithDetails`, cada una representando una
        serie con su club, cantidad de jugadores y sus respectivos datos.

    Lanza
    -----
    HTTPException
        Si no se encuentra ninguna serie o si ocurre un error en la base de datos.
    """
    try:

        # Traemos todas las series con su club asociado
        match current_user["admin"]:
            case True: 
                db_series = db.query(Serie).join(Club).all()
            case False:
                hoy = date.today()
                db_detalle = db.query(DetalleUsuarioClub).filter(
                    and_(
                        DetalleUsuarioClub.id_club == current_user["id_club"], 
                        DetalleUsuarioClub.rut_usuario == current_user["rut_usuario"],
                        or_(
                            DetalleUsuarioClub.fecha_fin == None,
                            DetalleUsuarioClub.fecha_fin >= hoy,
                        ),
                    )
                ).first()
                if not db_detalle: raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="No se pudo asociar la cuenta al club")

                db_series = db.query(Serie).join(Club).filter(Serie.id_club == current_user["id_club"]).all()
        
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

@handle_db_exceptions
def update_state_serie(db: Session, id_serie: int, serieUpdate: SerieUpdate, current_user: dict):
    """
    Actualiza el estado (activo/inactivo) de una serie en la base de datos.

    Esta función busca una serie según su identificador y actualiza el campo `serie_activa`
    con el valor proporcionado en el objeto `SerieUpdate`.  
    Las excepciones de base de datos son manejadas automáticamente por el decorador
    `handle_db_exceptions`.

    Parámetros
    ----------
    db : Session
        Sesión de base de datos de SQLAlchemy.
    id_serie : int
        Identificador único de la serie a actualizar.
    serieUpdate : SerieUpdate
        Objeto Pydantic con el nuevo estado de la serie.

    Retorna
    -------
    bool
        `True` si la serie fue actualizada correctamente.

    Lanza
    -----
    HTTPException
        Si no se encuentra la serie especificada o si ocurre un error en la base de datos.
    """
    match current_user["admin"]:
            case True: 
                db_serie = db.query(Serie).filter(Serie.id_serie == id_serie).first()
            case False:
                hoy = date.today()
                db_detalle = db.query(DetalleUsuarioClub).filter(
                    and_(
                        DetalleUsuarioClub.id_club == current_user["id_club"], 
                        DetalleUsuarioClub.rut_usuario == current_user["rut_usuario"],
                        or_(
                            DetalleUsuarioClub.fecha_fin == None,
                            DetalleUsuarioClub.fecha_fin >= hoy,
                        ),
                    )
                ).first()
                if not db_detalle: raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="No se pudo asociar la cuenta al club")

                db_serie = db.query(Serie).filter(Serie.id_serie == id_serie).first()
    if not db_serie: raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Serie no encontrada")
    db_serie.serie_activa = serieUpdate.state
    db.commit()
    db.refresh(db_serie)
    return True