from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/asistencias-reunion", tags=["Asistencia Reunion"])


@router.post("/", response_model=schemas.DetalleReunionRead)
def create_asistencia_reunion(
    asistencia: schemas.DetalleReunionCreate, db: Session = Depends(get_db)
):
    return services.create_asistencia_reunion(db, asistencia)


@router.get("/{id_reunion}/{correo_usu}", response_model=schemas.DetalleReunionRead)
def get_asistencia_reunion(
    id_reunion: int, correo_usu: str, db: Session = Depends(get_db)
):
    db_asistencia = services.get_asistencia_reunion(db, id_reunion, correo_usu)
    if db_asistencia is None:
        raise HTTPException(status_code=404, detail="Asistencia not found")
    return db_asistencia


@router.get("/", response_model=list[schemas.DetalleReunionRead])
def get_asistencias_reunion(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    return services.get_asistencias_reunion(db, skip=skip, limit=limit)


@router.put("/{id_reunion}/{correo_usu}", response_model=schemas.DetalleReunionRead)
def update_asistencia_reunion(
    id_reunion: int,
    correo_usu: str,
    asistencia: schemas.DetalleReunionUpdate,
    db: Session = Depends(get_db),
):
    db_asistencia = services.get_asistencia_reunion(db, id_reunion, correo_usu)
    if db_asistencia is None:
        raise HTTPException(status_code=404, detail="Asistencia not found")
    return services.update_asistencia_reunion(db, id_reunion, correo_usu, asistencia)


@router.delete("/{id_reunion}/{correo_usu}")
def delete_asistencia_reunion(
    id_reunion: int, correo_usu: str, db: Session = Depends(get_db)
):
    db_asistencia = services.get_asistencia_reunion(db, id_reunion, correo_usu)
    if db_asistencia is None:
        raise HTTPException(status_code=404, detail="Asistencia not found")

    if services.delete_asistencia_reunion(db, id_reunion, correo_usu):
        return {"detail": "Asistencia deleted successfully."}
    else:
        raise HTTPException(status_code=500, detail="Error deleting asistencia.")
