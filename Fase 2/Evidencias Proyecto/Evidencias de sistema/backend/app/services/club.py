from sqlalchemy.orm import Session
from sqlalchemy import func, distinct, asc, desc
from sqlalchemy.exc import IntegrityError, NoResultFound, SQLAlchemyError
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
    JugadorRead,
)
from fastapi import HTTPException


def get_club(db: Session, id_club: int) -> Club | None:
    try:
        return db.query(Club).filter(Club.id_club == id_club).first()
    except NoResultFound as e:
        raise HTTPException(status_code=404, detail="Club no encontrado") from e


def get_clubs(db: Session, skip: int = 0, limit: int = 100):
    try:
        return db.query(Club).offset(skip).limit(limit).order_by(desc(Club.club_activo), asc(Club.nombre_club).offset(skip)
            .limit(limit).all())
            
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail="Error interno del servidor") from e


def create_club(db: Session, club: ClubCreate) -> Club:
    try:
        db_club = Club(**club.dict())
        db.add(db_club)
        db.commit()
        db.refresh(db_club)
        return db_club
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=400, detail="Ya existe un club con este nombre."
        ) from e
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error interno del servidor") from e


def update_club(db: Session, id_club: int, club_update: ClubUpdate) -> Club | None:
    try:
        db_club = get_club(db, id_club)
        if not db_club:
            return None
        for key, value in club_update.dict(exclude_unset=True).items():
            setattr(db_club, key, value)
        db.commit()
        db.refresh(db_club)
        return db_club
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=400, detail="Ya existe un club con este nombre." #REVISAR POR EL EMAIL
        ) from e
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error interno del servidor") from e


def delete_club(db: Session, id_club: int) -> dict:
    try:
        db_club = get_club(db, id_club)
        db.delete(db_club)
        db.commit()
        return {"detail": "Club eliminado exitosamente."}
    except (SQLAlchemyError, HTTPException) as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error interno del servidor") from e


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
                directiva=[UsuarioRead.model_validate(u, from_attributes=True) for u in directiva],
                series=series,
                jugadores=jugadores,
            ) 
            club_with_details.append(club_details)
        return club_with_details
    except NoResultFound as e:
        raise HTTPException(status_code=404, detail="Club no encontrado") from e
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
