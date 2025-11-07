from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Solicitud
from app.schemas import (
    SolicitudCreate,
    SolicitudUpdate,
    SolicitudRead,
    SolicitudResponseUpdate,
    SolicitudWithUserClub,
)
from app.security import get_current_user
from app import services

router = APIRouter(prefix="/solicitudes", tags=["Solicitudes"])


@router.post("/", response_model=SolicitudRead)
def create_solicitud(
    solicitud: SolicitudCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return services.create_solicitud(db, solicitud, current_user=current_user)


@router.get("/{id_solicitud}", response_model=SolicitudRead)
def get_solicitud(
    id_solicitud: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    db_solicitud = services.get_solicitud(db, id_solicitud, current_user=current_user)
    if db_solicitud is None:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    return db_solicitud


@router.get("/", response_model=list[SolicitudWithUserClub])
def get_solicitudes(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return services.get_solicitudes(db, current_user=current_user)


@router.put("/{id_solicitud}", response_model=SolicitudRead)
def update_solicitud(
    id_solicitud: int,
    solicitud_update: SolicitudUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    db_solicitud = services.update_solicitud(
        db, id_solicitud, solicitud_update, current_user=current_user
    )
    if db_solicitud is None:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    return db_solicitud


@router.delete("/{id_solicitud}", response_model=dict)
def delete_solicitud(
    id_solicitud: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    success = services.delete_solicitud(db, id_solicitud, current_user=current_user)
    if not success:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    return {"detail": "Solicitud eliminada exitosamente"}


@router.patch("/{id_solicitud}/respond", response_model=SolicitudResponseUpdate)
def respond_solicitud(
    id_solicitud: int,
    response_data: SolicitudResponseUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if not current_user.get("admin"):
        raise HTTPException(
            status_code=403, detail="No autorizado para responder solicitudes"
        )

    db_solicitud = services.get_solicitud(db, id_solicitud, current_user=current_user)
    if db_solicitud is None:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    update_data = SolicitudUpdate(
        usuario_respuesta=current_user["rut_usuario"],
        estado=response_data.estado,
        respuesta=response_data.respuesta,
    )

    updated_solicitud = services.update_solicitud(
        db, id_solicitud, update_data, current_user=current_user
    )
    return SolicitudResponseUpdate(
        respuesta=updated_solicitud.respuesta, estado=updated_solicitud.estado
    )
