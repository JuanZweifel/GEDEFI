from sqlalchemy.orm import Session
from app.models import Serie, Club, Jugador, FichaJugador, DetalleUsuarioClub
from app.schemas import SerieWithDetails, JugadorRead, SerieCreate
from sqlalchemy import and_, or_
from sqlalchemy.exc import IntegrityError, NoResultFound, SQLAlchemyError, OperationalError, DisconnectionError
import psycopg2
from app.utils.decorators import handle_db_exceptions
from fastapi import HTTPException, status
from datetime import date
from app.utils.constantes import lista_series


@handle_db_exceptions
def create_massive_series(
    db: Session, id_club: int, current_user=dict
) -> list[Serie]:
    """
    Crea de manera masiva todos las instancias estandares de `Serie` asociadas a una instancia de `Club`

    Esta funcion crea todas las instancias estandares [
        "Segunda infantil",
        "Primera infantil",
        "Juveniles",
        "Super seniors",
        "Segunda adulta",
        "Primera adulta",
        "Seniors",
        "Serie honor",
        "Femenina",
        "Años dorados"
    ]
    asociadas a una instacia de `Club`, las instancias de `Serie` estan validadas bajo el schema de pydantic `SerieCreate`
    Requiere un dict autenticado obtenido mediante la dependencia `get_current_user`.
    Las excepciones de base de datos son manejadas automáticamente por el decorador `handle_db_exceptions`.


    Parámetros
    ----------
    db : Session
        Sesión de base de datos de SQLAlchemy.

    club: ClubCreate
        Objeto de pydantic con el formato del schema `ClubCreate`

    Retorna
    -------
    bool
        Retorna booleano, True, indicando el correcto almacenamiento.

    Lanza
    -----
    HTTPException
        Si ocurre algún error relacionado con la base de datos, manejado por `handle_db_exceptions`.
    """
    try:
        series = []
        for serie in lista_series:
            schema = SerieCreate(nombre_serie=serie, id_club=id_club)
            db_serie = Serie(**schema.model_dump())
            db.add(db_serie)
            series.append(db_serie)
        return series
    except IntegrityError as e:
        db.rollback()
        if isinstance(e.orig, psycopg2.errors.UniqueViolation):
            detail = (
                "El RUT ingresado esta asociado a otro club."
                if "CLUB_rut_club_key" in str(e.orig)
                else (
                    "El correo ingresado ya esta asociado a un club."
                    if "CLUB_email_club_key" in str(e.orig)
                    else (
                        "El nombre ingresado se encuentrado asociado a otro club"
                        if "CLUB_nombre_club_key" in str(e.orig)
                        else e.orig
                    )
                )
            )
            raise HTTPException(status_code=400, detail=detail) from e
        else:
            raise HTTPException(
                status_code=400, detail=f"Error de integridad en la base de datos"
            ) from e

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
def update_state_serie(db: Session, id_serie: int, current_user: dict):
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
    db_serie.serie_activa = not db_serie.serie_activa
    db.commit()
    db.refresh(db_serie)
    return db_serie.serie_activa