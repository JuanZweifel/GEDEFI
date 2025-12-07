from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload
from app.models import Partido, Serie, Club
from app.schemas import PartidoCreate, PartidoUpdate, PartidoRead
from app.services import create_rendimiento_partido
from app.utils.decorators import handle_db_exceptions
from fastapi import HTTPException, status
from typing import Optional
from ..models.partido import EstadoPartidoEnum

# TODO: Aplicar auth security para poder implementar auditoria
def get_partido(db: Session, partido_id: int) -> PartidoRead | None:
    """
    Obtiene un partido con sus nombres de clubs (local y visitante).
    """
    db_partido = db.query(Partido).options(
        joinedload(Partido.serie_local).joinedload(Serie.club),
        joinedload(Partido.serie_visitante).joinedload(Serie.club),
    ).filter(Partido.id_partido == partido_id).first()
    
    if not db_partido:
        return None
    
    # Obtener nombres de clubs
    club_local = db_partido.serie_local.club.nombre_club if db_partido.serie_local and db_partido.serie_local.club else ""
    club_visitante = db_partido.serie_visitante.club.nombre_club if db_partido.serie_visitante and db_partido.serie_visitante.club else ""
    
    # Construir PartidoRead
    partido_dict = db_partido.__dict__.copy()
    partido_dict["club_local"] = club_local
    partido_dict["club_visitante"] = club_visitante
    
    return PartidoRead.model_validate(partido_dict, from_attributes=True)

@handle_db_exceptions
def get_partidos(db: Session, current_user: dict, skip: Optional[int] = None, limit: Optional[int] = None) -> dict:
    """
    Obtiene partidos con nombres de clubs (local y visitante).
    Para no-admins, filtra por id_club del usuario.
    """
    db_query = db.query(Partido)

    # Determinar si es administrador (soportamos 'asociacion' o rol 'Administrador')
    is_admin = bool(current_user.get("asociacion") or current_user.get("rol") == "Administrador")

    if not is_admin:
        id_club = current_user.get("id_club")
        if id_club is None:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para acceder a estos partidos (id_club ausente)")
        # Subconsulta con los id_serie pertenecientes al club del usuario
        series_subq = db.query(Serie.id_serie).filter(Serie.id_club == id_club)

        db_query = db_query.filter(
            or_(
                Partido.id_serie_local.in_(series_subq),
                Partido.id_serie_visitante.in_(series_subq),
            )
        )

    # Eager loading de serie_local -> club y serie_visitante -> club
    db_query = db_query.options(
        joinedload(Partido.serie_local).joinedload(Serie.club),
        joinedload(Partido.serie_visitante).joinedload(Serie.club),
    )

    total = db_query.count()
    if skip is not None and limit is not None:
        db_query = db_query.offset(skip).limit(limit)
    db_partidos = db_query.all()

    if not db_partidos:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No hay partidos registrados.")

    # Convertir a PartidoRead con nombres de clubs
    partidos_read = []
    for db_partido in db_partidos:
        club_local = db_partido.serie_local.club.nombre_club if db_partido.serie_local and db_partido.serie_local.club else ""
        club_visitante = db_partido.serie_visitante.club.nombre_club if db_partido.serie_visitante and db_partido.serie_visitante.club else ""
        
        partido_dict = db_partido.__dict__.copy()
        partido_dict["club_local"] = club_local
        partido_dict["club_visitante"] = club_visitante
        
        partidos_read.append(PartidoRead.model_validate(partido_dict, from_attributes=True))

    return {"total": total, "items": partidos_read}


def create_partido(db: Session, partido: PartidoCreate) -> Partido:
    db_partido = Partido(**partido.dict())
    db.add(db_partido)
    db.commit()
    db.refresh(db_partido)
    return db_partido


def update_partido(db: Session, partido_id: int, partido_update: PartidoUpdate) -> Partido | None:
    db_partido = db.query(Partido).filter(Partido.id_partido == partido_id).first()
    if not db_partido:
        return None
    data = partido_update.dict(exclude_unset=True)

    if data.get("id_cancha") == 0:
        data.pop("id_cancha")
    for key, value in partido_update.dict(exclude_unset=True).items():
        setattr(db_partido, key, value)
    

    db.flush()
    db.refresh(db_partido)
    if data.get("estado_partido") == EstadoPartidoEnum.FINALIZADO:
        create_rendimiento_partido(db, partido_id)
    db.commit()
    return db_partido


def delete_partido(db: Session, partido_id: int) -> bool:
    db_partido = get_partido(db, partido_id)
    if not db_partido:
        return False
    db.delete(db_partido)
    db.commit()
    return True

def get_partidos_by_serie(db: Session, id_serie: int) -> list[PartidoRead]:
    """
    Obtiene partidos de una serie (como local o visitante) con nombres de clubs.
    """
    db_partidos = db.query(Partido).options(
        joinedload(Partido.serie_local).joinedload(Serie.club),
        joinedload(Partido.serie_visitante).joinedload(Serie.club),
    ).filter(
        (Partido.id_serie_local == id_serie) | (Partido.id_serie_visitante == id_serie)
    ).all()
    
    # Convertir a PartidoRead con nombres de clubs
    partidos_read = []
    for db_partido in db_partidos:
        club_local = db_partido.serie_local.club.nombre_club if db_partido.serie_local and db_partido.serie_local.club else ""
        club_visitante = db_partido.serie_visitante.club.nombre_club if db_partido.serie_visitante and db_partido.serie_visitante.club else ""
        
        partido_dict = db_partido.__dict__.copy()
        partido_dict["club_local"] = club_local
        partido_dict["club_visitante"] = club_visitante
        
        partidos_read.append(PartidoRead.model_validate(partido_dict, from_attributes=True))
    
    return partidos_read