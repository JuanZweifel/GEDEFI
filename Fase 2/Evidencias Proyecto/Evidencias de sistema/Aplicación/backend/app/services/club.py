from sqlalchemy.orm import Session
from sqlalchemy import func, distinct, asc, desc
import psycopg2
from sqlalchemy.exc import IntegrityError, NoResultFound, SQLAlchemyError, OperationalError, DisconnectionError
from app.models import (
    Club,
    Usuario,
    Jugador,
    Serie,
    DetalleClubJugador,
    DetalleUsuarioClub,
)
from app.schemas import (
    ClubCreate,
    ClubUpdate,
    ClubWithDetails,
    UsuarioRead,
    SerieRead,
    UsuarioRead,
    JugadorRead,
    SerieList,
    UsuarioList,
    JugadorList
)
from fastapi import HTTPException


def get_club(db: Session, id_club: int) -> Club | None:
    try:
        return db.query(Club).filter(Club.id_club == id_club).first()
    except (DisconnectionError, OperationalError) as e: 
        raise HTTPException(status_code=500, detail="Problemas de conexión con la base de datos.") from e
    
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
        raise HTTPException(status_code=500, detail="Problemas de conexión con la base de datos.") from e
    
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail="Error interno del servidor") from e


def create_club(db: Session, club: ClubCreate) -> bool:
    try:
        db_club = Club(**club.dict())
        db.add(db_club)
        db.commit()
        db.refresh(db_club)
        return True
    except IntegrityError as e:
        db.rollback()
        if isinstance(e.orig, psycopg2.errors.UniqueViolation):
            raise HTTPException(
                status_code=400, detail=f"El correo ingresado ya esta asociado a un club."
            ) from e
        else:
            raise HTTPException(
                status_code=400, detail=f"Error de integridad en la base de datos"
            ) from e
    except (DisconnectionError, OperationalError) as e: 
        raise HTTPException(status_code=500, detail="Problemas de conexión con la base de datos.") from e
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
        if isinstance(e.orig, psycopg2.errors.UniqueViolation):
            raise HTTPException(
                status_code=400, detail=f"El correo ingresado ya esta asociado a un club."
            ) from e
        else:
            raise HTTPException(
                status_code=400, detail=f"Error de integridad en la base de datos"
            ) from e
    except (DisconnectionError, OperationalError) as e: 
        raise HTTPException(status_code=500, detail="Problemas de conexión con la base de datos.") from e
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
            raise HTTPException(status_code=500, detail="No puedes borrar un club que tenga registros asociados.") from e
        else:
            raise HTTPException(status_code=500, detail={"error": e.orig.args}) from e
    except (DisconnectionError, OperationalError) as e:
        raise HTTPException(status_code=500, detail="Problemas de conexión con la base de datos.") from e
    except (SQLAlchemyError, HTTPException) as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error interno del servidor" if isinstance(e, SQLAlchemyError) else e.detail) from e


def get_club_with_details(db: Session) -> list[Club] | None:
    try:
        db_clubs = db.query(Club).all()

        club_with_details = []

        for club in db_clubs:
            directiva = (
                db.query(Usuario)
                .join(
                    DetalleUsuarioClub,
                    Usuario.rut_usuario == DetalleUsuarioClub.rut_usuario,
                )
                .filter(DetalleUsuarioClub.id_club == club.id_club)
                .all()
            )

            series = db.query(Serie).filter(Serie.id_club == club.id_club).count()

            jugadores = (
                db.query(func.count(distinct(Jugador.rut_jugador)))
                .join(
                    DetalleClubJugador,
                    Jugador.rut_jugador == DetalleClubJugador.rut_jugador,
                )
                .filter(DetalleClubJugador.id_club == club.id_club)
                .scalar()
            )

            club_details = ClubWithDetails(
                **club.__dict__,
                directiva=[
                    UsuarioRead.model_validate(u, from_attributes=True)
                    for u in directiva
                ],
                series=series,
                jugadores=jugadores,
            )
            club_with_details.append(club_details)
        return club_with_details
    except NoResultFound as e:
        raise HTTPException(status_code=404, detail="Club no encontrado") from e
    except (DisconnectionError, OperationalError) as e: 
        raise HTTPException(status_code=500, detail="Problemas de conexión con la base de datos.") from e
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


def get_series_club(db: Session, id_club: int) -> SerieList:
    try:
        db_club = get_club(db, id_club=id_club)
        if db_club is None:
            raise HTTPException(
                status_code=404,
                detail={"details": f"No se encontro club asociado al id {id_club}"},
            )
        series_club = db.query(Serie).filter(Serie.id_club == db_club.id_club).all()
        series_pydantic = [SerieRead.model_validate(s) for s in series_club]
        return SerieList(series=series_pydantic)
    except (DisconnectionError, OperationalError) as e: 
        raise HTTPException(status_code=500, detail="Problemas de conexión con la base de datos.") from e
    except HTTPException as e:
        raise HTTPException(status_code=500, detail="Error interno del servidor" if isinstance(e, SQLAlchemyError) else e.detail) from e


def get_users_club(db: Session, id_club) -> UsuarioList:
    try:
        db_club = get_club(db, id_club=id_club)
        if db_club is None:
            raise HTTPException(
                status_code=404,
                detail={"details": f"No se encontro club asociado al id {id_club}"},
            )
        usuarios_club = (
            db.query(Usuario)
            .join(
                DetalleUsuarioClub,
                Usuario.rut_usuario == DetalleUsuarioClub.rut_usuario,
            )
            .filter(DetalleUsuarioClub.id_club == db_club.id_club)
            .all()
        )
        usuarios_pydantic = [UsuarioRead.model_validate(u, from_attributes=True) for u in usuarios_club]
        return UsuarioList(usuarios=usuarios_pydantic)
    except (DisconnectionError, OperationalError) as e: 
        raise HTTPException(status_code=500, detail="Problemas de conexión con la base de datos.") from e
    except HTTPException as e:
        raise HTTPException(status_code=500, detail="Error interno del servidor" if isinstance(e, SQLAlchemyError) else e.detail) from e


def get_players_club(db: Session, id_club) -> JugadorList:
    try:
        db_club = get_club(db, id_club=id_club)
        if db_club is None:
            raise HTTPException(
                status_code=404,
                detail={"details": f"No se encontro club asociado al id {id_club}"},
            )
        jugadores_club = (
            db.query(Jugador)
            .join(
                DetalleClubJugador,
                Jugador.rut_jugador == DetalleClubJugador.rut_jugador,
            )
            .filter(DetalleClubJugador.id_club == db_club.id_club)
            .all()
        )
        jugadores_pydantic = [JugadorRead.model_validate(j) for j in jugadores_club]
        return JugadorList(jugadores=jugadores_pydantic)
    except (DisconnectionError, OperationalError) as e: 
        raise HTTPException(status_code=500, detail="Problemas de conexión con la base de datos.") from e
    except HTTPException as e:
        raise HTTPException(status_code=500, detail="Error interno del servidor" if isinstance(e, SQLAlchemyError) else e.detail) from e
