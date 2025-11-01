from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.models import Solicitud, Usuario, Club, DetalleUsuarioClub
from app.schemas import SolicitudCreate, SolicitudUpdate
from app.utils.decorators import handle_db_exceptions


@handle_db_exceptions
def get_solicitud(db: Session, id_solicitud: int) -> Solicitud | None:
    return db.query(Solicitud).filter(Solicitud.id_solicitud == id_solicitud).first()


@handle_db_exceptions
def get_solicitudes(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(
            Solicitud.id_solicitud,
            Solicitud.categoria,
            Solicitud.descripcion,
            Solicitud.estado,
            Solicitud.respuesta,
            Solicitud.fecha_creacion,
            Usuario.nombre_usuario.label("nombre_usuario"),
            Usuario.apellido_usuario.label("apellido_usuario"),
            Club.nombre_club.label("nombre_club"),
        )
        .join(Usuario, Solicitud.usuario_solicitud == Usuario.rut_usuario)
        .join(DetalleUsuarioClub, DetalleUsuarioClub.rut_usuario == Usuario.rut_usuario)
        .join(Club, DetalleUsuarioClub.id_club == Club.id_club)
        .filter(DetalleUsuarioClub.fecha_fin.is_(None))
        .offset(skip)
        .limit(limit)
        .all()
    )


@handle_db_exceptions
def create_solicitud(db: Session, solicitud_data: SolicitudCreate) -> Solicitud:
    db_solicitud = Solicitud(**solicitud_data.dict())
    db.add(db_solicitud)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise
    db.refresh(db_solicitud)
    return db_solicitud


@handle_db_exceptions
def update_solicitud(
    db: Session, id_solicitud: int, solicitud_update: SolicitudUpdate
) -> Solicitud | None:
    db_solicitud: Solicitud = get_solicitud(db, id_solicitud)
    if not db_solicitud:
        return None

    for key, value in solicitud_update.dict(exclude_unset=True).items():
        setattr(db_solicitud, key, value)

    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise
    db.refresh(db_solicitud)
    return db_solicitud


@handle_db_exceptions
def delete_solicitud(db: Session, id_solicitud: int) -> bool:
    db_solicitud: Solicitud = get_solicitud(db, id_solicitud)
    if not db_solicitud:
        return False

    db.delete(db_solicitud)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise
    return True


@handle_db_exceptions
def respond_solicitud(
    db: Session,
    id_solicitud: int,
    respuesta: str,
    estado: bool,
) -> Solicitud | None:
    db_solicitud = (
        db.query(Solicitud).filter(Solicitud.id_solicitud == id_solicitud).first()
    )
    if not db_solicitud:
        return None

    db_solicitud.respuesta = respuesta
    db_solicitud.estado = estado

    db.commit()
    db.refresh(db_solicitud)
    return db_solicitud
