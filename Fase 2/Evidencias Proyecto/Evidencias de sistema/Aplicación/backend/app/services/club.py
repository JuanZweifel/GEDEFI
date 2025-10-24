from sqlalchemy.orm import Session
from sqlalchemy import asc, desc, and_, or_
import psycopg2
from sqlalchemy.exc import (
    IntegrityError,
    NoResultFound,
)
from app.models import (
    Club,
    Usuario,
    Jugador,
    Serie,
    DetalleClubJugador,
    DetalleUsuarioClub,
    FichaJugador,
    Rol,
)
from app.schemas import (
    ClubCreate,
    ClubUpdate,
    ClubWithDetails,
    UsuarioForClub,
    SerieWithDetails,
    JugadorBase,
    SerieCreate,
)

from app.services.serie import create_massive_series
from fastapi import HTTPException, status
from app.utils.decorators import handle_db_exceptions
from datetime import date


@handle_db_exceptions
def get_club(
    db: Session, id_club: int, current_user:dict
) -> Club | None:
    """
    Obtiene un registro de club desde la base de datos utilizando su identificador único.

    Esta función consulta la base de datos para buscar una instancia del modelo `Club`
    que coincida con el `id_club` proporcionado. Requiere un dict autenticado
    obtenido mediante la dependencia `get_current_user`.
    Las excepciones de base de datos son manejadas automáticamente por el decorador
    `handle_db_exceptions`.

    Parámetros
    ----------
    db : Session
        Sesión de base de datos de SQLAlchemy.
    id_club : int
        Identificador único del club a recuperar.
    current_user : User
        dict autenticado obtenido mediante la inyección de dependencias.

    Retorna
    -------
    Club o None
        Instancia del modelo `Club` si se encuentra el registro, de lo contrario `None`.

    Lanza
    -----
    HTTPException
        Si ocurre algún error relacionado con la base de datos, manejado por `handle_db_exceptions`.
    """
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

    if (not db_detalle and not current_user.get("admin")) or (not current_user.get("admin") and id_club != current_user["id_club"]): raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso de acceder a este club")
    return db.query(Club).filter(Club.id_club == id_club).first()


@handle_db_exceptions
def get_clubs(db: Session, current_user: dict) -> list[Club]:
    """
    Obtiene todos los registros de club almacenados en la base de datos

    Esta función consulta la base de datos para buscar todas las instancias de `Club`
    Requiere un dict autenticado obtenido mediante la dependencia `get_current_user`.
    Las excepciones de base de datos son manejadas automáticamente por el decorador
    `handle_db_exceptions`.

    Parámetros
    ----------
    db : Session
        Sesión de base de datos de SQLAlchemy.

    Retorna
    -------
    list[Club]
        Lista de instacias de Club, en caso de no haber clubs en la base de datos la lista vendra vacia.

    Lanza
    -----
    HTTPException
        Si ocurre algún error relacionado con la base de datos, manejado por `handle_db_exceptions`.
    """
    
    if not current_user["admin"]: raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para acceder a todos los clubs")
    return db.query(Club).order_by(desc(Club.club_activo), asc(Club.nombre_club)).all()


@handle_db_exceptions
def create_club(
    db: Session, club: ClubCreate, current_user:dict
) -> bool:
    """
    Crea una instancia de `Club` para su posterior almacenamiento en la base datos.

    Esta función crea una instancia de `Club`. La instancia esta validada mediante el schema `ClubCreate` de pydantic.
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
        if not current_user["admin"]: raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permito para crear un club")
        db_club = Club(**club.model_dump())
        db.add(db_club)
        db.flush()
        db.refresh(db_club)

        create_massive_series(db, db_club.id_club)

        db.commit()
        db.refresh(db_club)
        return True
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
def update_club(
    db: Session,
    id_club: int,
    club_update: ClubUpdate,
    current_user: dict,
):
    """
    Actualiza una instancia de `Club`.

    Esta función actualiza una instancia existente de `Club` en la base de datos, validando los datos
    mediante el schema `ClubUpdate` de Pydantic.  
    Requiere un dict autenticado obtenido mediante la dependencia `get_current_user`.  

    El comportamiento de actualización depende del nivel de privilegio del usuario autenticado:
    
    - Si `current_user["admin"]` es **True**, puede modificar **todos los campos** del club.  
    - Si `current_user["admin"]` es **False**, solo puede modificar los campos:
        `logo_club`, `color_primario`, `color_secundario` y `color_respaldo`.  
    
    Las excepciones de base de datos son manejadas automáticamente por el decorador `handle_db_exceptions`.

    Parámetros
    ----------
    db : Session
        Sesión de base de datos de SQLAlchemy.
    
    id_club : int
        Identificador único del club a actualizar.
    
    club_update : ClubUpdate
        Objeto de Pydantic con el formato del schema `ClubUpdate`, que contiene los
        campos a modificar en la entidad `Club`.
    
    current_user : dict
        Diccionario con la información del usuario autenticado, incluyendo su nivel de privilegio (`admin`).

    Retorna
    -------
    bool
        Retorna `True` indicando que la actualización fue realizada exitosamente.
        Retorna `None` si no se encontró el club correspondiente.

    Lanza
    -----
    HTTPException
        Si ocurre algún error relacionado con la base de datos, manejado por `handle_db_exceptions`.
    """
    try:
        db_club = get_club(db, id_club, current_user)
        if not db_club:
            return None

        # Determinar campos permitidos según permisos
        if current_user.get("admin"):
            # Admin puede actualizar todo
            campos_permitidos = set(club_update.dict(exclude_unset=True).keys())
        else:
            # No admin solo puede actualizar logo y colores
            campos_permitidos = {"logo_club", "color_primario", "color_secundario", "color_respaldo"}

        # Actualizar solo los campos permitidos
        for key, value in club_update.dict(exclude_unset=True).items():
            if key in campos_permitidos:
                setattr(db_club, key, value)

        db.commit()
        db.refresh(db_club)
        return True

    except IntegrityError as e:
        db.rollback()
        detail = (
            "El RUT ingresado está asociado a otro club."
            if "CLUB_rut_club_key" in str(e.orig)
            else (
                "El correo ingresado ya está asociado a un club."
                if "CLUB_email_club_key" in str(e.orig)
                else (
                    "El nombre ingresado se encuentra asociado a otro club."
                    if "CLUB_nombre_club_key" in str(e.orig)
                    else str(e.orig)
                )
            )
        )
        raise HTTPException(status_code=400, detail=detail) from e


@handle_db_exceptions
def delete_club(db: Session, id_club: int, current_user:dict):
    try:
        if not current_user["admin"]: raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para borrar un club.")
        db_club = get_club(db, id_club, current_user)
        db.delete(db_club)
        db.commit()
        return True
    except AssertionError as e:
        raise HTTPException(
            status_code=500,
            detail="No puedes borrar un club que tenga registros asociados.",
        ) from e
    except IntegrityError as e:
        if isinstance(e.orig, psycopg2.errors.NotNullViolation):
            raise HTTPException(
                status_code=500,
                detail="No puedes borrar un club que tenga registros asociados.",
            ) from e
        else:
            raise HTTPException(status_code=500, detail={"error": e.orig.args}) from e


@handle_db_exceptions
def get_clubs_with_details(
    db: Session, current_user:dict
) -> list[ClubWithDetails] | None:
    """
    Devuelve todas las instancias de `Club` con información extra de las instancias: `dict`, `Jugador` y `Serie`

    Esta función retorna todas las instancias de `Club`, con información extra. Estas instancias estan validadas con el schema de pydantic `ClubWithDetails`
    Requiere un dict autenticado obtenido mediante la dependencia `get_current_user`.
    Las excepciones de base de datos son manejadas automáticamente por el decorador `handle_db_exceptions`.


    Parámetros
    ----------
    db : Session
        Sesión de base de datos de SQLAlchemy.

    Retorna
    -------
    list[ClubWithDetails]
        Retorna la lista de instancias validadas y formateadas por el schema de `ClubWithDetails`

    Lanza
    -----
    HTTPException
        Si ocurre algún error relacionado con la base de datos, manejado por `handle_db_exceptions`.
    """
    try:
        hoy = date.today()
        if not current_user.get("admin") and current_user.get("id_club") != None:
            db_clubs = db.query(Club).filter(Club.id_club == current_user["id_club"])
        elif current_user.get("admin", True):
            db_clubs = db.query(Club).all()
        else:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para acceder a todos los clubs")
        club_with_details: list[ClubWithDetails] = []

        for club in db_clubs:
            # --- DIRECTIVA ---
            db_directiva = (
                db.query(Usuario)
                .join(
                    DetalleUsuarioClub,
                    Usuario.rut_usuario == DetalleUsuarioClub.rut_usuario,
                )
                .filter(
                    and_(
                        DetalleUsuarioClub.id_club == club.id_club,
                        or_(
                            DetalleUsuarioClub.fecha_fin == None,
                            DetalleUsuarioClub.fecha_fin >= hoy,
                        ),
                    )
                )
                .all()
            )

            # --- SERIES ---
            db_series = db.query(Serie).filter(Serie.id_club == club.id_club).all()

            # --- JUGADORES (todos los jugadores del club, por DetalleClubJugador) ---
            db_jugadores = (
                db.query(Jugador)
                .join(
                    DetalleClubJugador,
                    Jugador.rut_jugador == DetalleClubJugador.rut_jugador,
                )
                .filter(DetalleClubJugador.id_club == club.id_club)
                .all()
            )

            # --- Ajustar logo si existe ---
            if club.logo_club:
                club.logo_club = club.logo_club.replace(
                    "../images", "http://localhost:8000/images"
                )

            # --- Construcción de DIRECTIVA con rol incluido ---
            usuarios_for_club = []
            for u in db_directiva:
                role_name = None
                role_obj = None

                if hasattr(u, "rol"):
                    role_obj = getattr(u, "rol")
                elif hasattr(u, "role"):
                    role_obj = getattr(u, "role")

                if role_obj is not None:
                    role_name = getattr(role_obj, "nombre_rol", None) or getattr(
                        role_obj, "name", None
                    )
                else:
                    if getattr(u, "id_rol", None) is not None:
                        rol_db = db.query(Rol).filter(Rol.id_rol == u.id_rol).first()
                        if rol_db:
                            role_name = getattr(rol_db, "nombre_rol", None) or getattr(
                                rol_db, "name", None
                            )

                usuario_dict = {
                    "rut_usuario": getattr(u, "rut_usuario", None),
                    "email_usuario": getattr(u, "email_usuario", None),
                    "nombre_usuario": getattr(u, "nombre_usuario", None),
                    "apellido_usuario": getattr(u, "apellido_usuario", None),
                    "fecha_nacimiento": getattr(u, "fecha_nacimiento", None),
                    "id_rol": getattr(u, "id_rol", None),
                    "nombre_rol": role_name or "",
                }

                usuarios_for_club.append(UsuarioForClub.model_validate(usuario_dict))

            # --- Construcción de SERIES (con cantidad de jugadores desde FichaJugador) ---
            series_for_club = []
            for s in db_series:
                # contar jugadores únicos asociados a esta serie a través de FICHA_JUGADOR
                jugadores_serie = (
                    db.query(Jugador)
                    .join(FichaJugador)
                    .filter(FichaJugador.id_serie == s.id_serie)
                    .all()
                )  # TODO: REVISAR FICHAS INACTIVAS

                serie_dict = {
                    **s.__dict__,
                    "cantidad_jugadores": len(jugadores_serie),
                    "nombre_club": club.nombre_club,
                }

                series_for_club.append(
                    SerieWithDetails.model_validate(serie_dict, from_attributes=True)
                )

            # --- Construcción final del objeto ClubWithDetails ---
            club_details = ClubWithDetails(
                **club.__dict__,
                directiva=usuarios_for_club,
                series=series_for_club,
                jugadores=[
                    JugadorBase.model_validate(j, from_attributes=True)
                    for j in db_jugadores
                ],
            )

            club_with_details.append(club_details)

        return club_with_details

    except NoResultFound:
        raise HTTPException(status_code=404, detail="Club no encontrado")

@handle_db_exceptions
def get_club_with_details(db:Session, current_user: dict, id_club) -> ClubWithDetails:
    hoy = date.today()
    id_club = current_user["id_club"]
    rut_ususario = current_user["rut_usuario"]

    db_detalle = db.query(DetalleUsuarioClub).filter(
        and_(
            DetalleUsuarioClub.id_club == id_club,
            DetalleUsuarioClub.rut_usuario == rut_ususario,
            or_(
                DetalleUsuarioClub.fecha_fin == None,
                DetalleUsuarioClub.fecha_fin >= hoy,
            ),
        )
    ).first()
    if not db_detalle: raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso de acceder a este club")

    db_club = db.query(Club).filter(Club.id_club == id_club).first()

    if not db_club: raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club no encontrado")

    # --- DIRECTIVA ---
    db_directiva = (
        db.query(Usuario)
        .join(
            DetalleUsuarioClub,
            Usuario.rut_usuario == DetalleUsuarioClub.rut_usuario,
        )
        .filter(
            and_(
                DetalleUsuarioClub.id_club == db_club.id_club,
                or_(
                    DetalleUsuarioClub.fecha_fin == None,
                    DetalleUsuarioClub.fecha_fin >= hoy,
                ),
            )
        )
        .all()
    )

    # --- SERIES ---
    db_series = db.query(Serie).filter(Serie.id_club == db_club.id_club).all()

    # --- JUGADORES (todos los jugadores del club, por DetalleClubJugador) ---
    db_jugadores = (
        db.query(Jugador)
        .join(
            DetalleClubJugador,
            Jugador.rut_jugador == DetalleClubJugador.rut_jugador,
        )
        .filter(DetalleClubJugador.id_club == db_club.id_club)
        .all()
    )

    # --- Ajustar logo si existe ---
    if db_club.logo_club:
        db_club.logo_club = db_club.logo_club.replace(
            "../images", "http://localhost:8000/images"
        )

    # --- Construcción de DIRECTIVA con rol incluido ---
    usuarios_for_club = []
    for u in db_directiva:
        role_name = None
        role_obj = None

        if hasattr(u, "rol"):
            role_obj = getattr(u, "rol")
        elif hasattr(u, "role"):
            role_obj = getattr(u, "role")

        if role_obj is not None:
            role_name = getattr(role_obj, "nombre_rol", None) or getattr(
                role_obj, "name", None
            )
        else:
            if getattr(u, "id_rol", None) is not None:
                rol_db = db.query(Rol).filter(Rol.id_rol == u.id_rol).first()
                if rol_db:
                    role_name = getattr(rol_db, "nombre_rol", None) or getattr(
                        rol_db, "name", None
                    )

        usuario_dict = {
            "rut_usuario": getattr(u, "rut_usuario", None),
            "email_usuario": getattr(u, "email_usuario", None),
            "nombre_usuario": getattr(u, "nombre_usuario", None),
            "apellido_usuario": getattr(u, "apellido_usuario", None),
            "fecha_nacimiento": getattr(u, "fecha_nacimiento", None),
            "id_rol": getattr(u, "id_rol", None),
            "nombre_rol": role_name or "",
        }

        usuarios_for_club.append(UsuarioForClub.model_validate(usuario_dict))

    # --- Construcción de SERIES (con cantidad de jugadores desde FichaJugador) ---
    series_for_club = []
    for s in db_series:
        # contar jugadores únicos asociados a esta serie a través de FICHA_JUGADOR
        jugadores_serie = (
            db.query(Jugador)
            .join(FichaJugador)
            .filter(FichaJugador.id_serie == s.id_serie)
            .all()
        )  # TODO: REVISAR FICHAS INACTIVAS

        serie_dict = {
            **s.__dict__,
            "cantidad_jugadores": len(jugadores_serie),
            "nombre_club": db_club.nombre_club,
        }

        series_for_club.append(
            SerieWithDetails.model_validate(serie_dict, from_attributes=True)
        )

    # --- Construcción final del objeto ClubWithDetails ---
    club_details = ClubWithDetails(
        **db_club.__dict__,
        directiva=usuarios_for_club,
        series=series_for_club,
        jugadores=[
            JugadorBase.model_validate(j, from_attributes=True)
            for j in db_jugadores
        ],
    )
    return club_details


