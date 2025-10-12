from sqlalchemy.orm import Session
from sqlalchemy import func, distinct, asc, desc
import psycopg2
from sqlalchemy.exc import (
    IntegrityError,
    NoResultFound,
    SQLAlchemyError,
    OperationalError,
    DisconnectionError,
)
from app.models import (
    Club,
    Usuario,
    Jugador,
    Serie,
    DetalleClubJugador,
    DetalleUsuarioClub,
    FichaJugador,
    Rol
)
from app.schemas import (
    ClubCreate,
    ClubUpdate,
    ClubWithDetails,
    UsuarioForClub,
    SerieForClub,
    JugadorBase,
    SerieCreate
)
from fastapi import HTTPException
from app.utils.constantes import lista_series


def get_club(db: Session, id_club: int) -> Club | None:
    try:
        return db.query(Club).filter(Club.id_club == id_club).first()
    except (DisconnectionError, OperationalError) as e:
        raise HTTPException(
            status_code=500, detail="Problemas de conexión con la base de datos."
        ) from e

    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail="Error interno del servidor") from e


def get_clubs(db: Session, skip: int = 0, limit: int = 100):
    try:
        return (
            db.query(Club)
            .offset(skip)
            .limit(limit)
            .order_by(
                desc(Club.club_activo),
                asc(Club.nombre_club).offset(skip).limit(limit).all(),
            )
        )
    except (DisconnectionError, OperationalError) as e:
        raise HTTPException(
            status_code=500, detail="Problemas de conexión con la base de datos."
        ) from e

    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail="Error interno del servidor") from e


def create_club(db: Session, club: ClubCreate) -> bool:
    try:
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
    except (DisconnectionError, OperationalError) as e:
        raise HTTPException(
            status_code=500, detail="Problemas de conexión con la base de datos."
        ) from e
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error interno del servidor") from e

def create_massive_series(db: Session, id_club: int):
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
    except (DisconnectionError, OperationalError) as e:
        raise HTTPException(
            status_code=500, detail="Problemas de conexión con la base de datos."
        ) from e
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error interno del servidor") from e


def update_club(db: Session, id_club: int, club_update: ClubUpdate) -> bool | None:
    try:
        db_club = get_club(db, id_club)
        if not db_club:
            return None
        for key, value in club_update.dict(exclude_unset=True).items():
            setattr(db_club, key, value)
        db.commit()
        db.refresh(db_club)
        return True
    except IntegrityError as e:
        db.rollback()
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
    except (DisconnectionError, OperationalError) as e:
        raise HTTPException(
            status_code=500, detail="Problemas de conexión con la base de datos."
        ) from e
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error interno del servidor") from e


def delete_club(db: Session, id_club: int) -> bool:
    try:
        db_club = get_club(db, id_club)
        db.delete(db_club)
        db.commit()
        return True
    except IntegrityError as e:
        if isinstance(e.orig, psycopg2.errors.NotNullViolation):
            raise HTTPException(
                status_code=500,
                detail="No puedes borrar un club que tenga registros asociados.",
            ) from e
        else:
            raise HTTPException(status_code=500, detail={"error": e.orig.args}) from e
    except (DisconnectionError, OperationalError) as e:
        raise HTTPException(
            status_code=500, detail="Problemas de conexión con la base de datos."
        ) from e
    except (SQLAlchemyError, HTTPException) as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=(
                "Error interno del servidor"
                if isinstance(e, SQLAlchemyError)
                else e.detail
            ),
        ) from e


def get_club_with_details(db: Session) -> list[ClubWithDetails] | None:
    try:
        db_clubs = db.query(Club).all()
        club_with_details: list[ClubWithDetails] = []

        for club in db_clubs:
            # --- DIRECTIVA ---
            db_directiva = (
                db.query(Usuario)
                .join(
                    DetalleUsuarioClub,
                    Usuario.rut_usuario == DetalleUsuarioClub.rut_usuario,
                )
                .filter(DetalleUsuarioClub.id_club == club.id_club)
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

            # --- CANTIDADES GLOBALES ---
            cantidad_series = len(db_series)
            cantidad_jugadores = len(db_jugadores)

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
                cant_jugadores_serie = (
                    db.query(func.count(func.distinct(FichaJugador.rut_jugador)))
                    .filter(FichaJugador.id_serie == s.id_serie)
                    .scalar()
                )

                serie_dict = {
                    **s.__dict__,
                    "cantidad_jugadores": cant_jugadores_serie or 0,
                }

                series_for_club.append(
                    SerieForClub.model_validate(serie_dict, from_attributes=True)
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
                cantidad_series=cantidad_series,
                cantidad_jugadores=cantidad_jugadores,
            )

            club_with_details.append(club_details)

        return club_with_details

    except NoResultFound:
        raise HTTPException(status_code=404, detail="Club no encontrado")
    except (DisconnectionError, OperationalError):
        raise HTTPException(
            status_code=500, detail="Problemas de conexión con la base de datos."
        )
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=str(e))