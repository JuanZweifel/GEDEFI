from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload
from app.models import Partido, Serie
from app.schemas import PartidoCreate, PartidoUpdate, PartidoRead
from app.services import create_rendimiento_partido
from app.utils.decorators import handle_db_exceptions
from fastapi import HTTPException, status

from ..models.partido import EstadoPartidoEnum

# TODO: Aplicar auth security para poder implementar auditoria
def get_partido(db: Session, partido_id: int) -> Partido | None:
    return db.query(Partido).filter(Partido.id_partido == partido_id).first()

@handle_db_exceptions
def get_partidos(db: Session, current_user: dict, skip: int = 0, limit: int = 100):
    db_query = db.query(Partido)

    if not current_user.get("admin"):
        db_query.options(
            joinedload(Partido.serie_local).joinedload(Serie.club),
            joinedload(Partido.serie_visitante).joinedload(Serie.club)
        ).filter(or_(Partido.serie_local.id_club == current_user.get("id_club"),
                    Partido.serie_visitante.id_club == current_user.get("id_club")
        ))
    
    db_partidos = db_query.all()

    if not db_partidos: raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No hay partidos registrados.")

    return db_partidos  


def create_partido(db: Session, partido: PartidoCreate) -> Partido:
    db_partido = Partido(**partido.dict())
    db.add(db_partido)
    db.commit()
    db.refresh(db_partido)
    return db_partido


def update_partido(db: Session, partido_id: int, partido_update: PartidoUpdate) -> Partido | None:
    db_partido = get_partido(db, partido_id)
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