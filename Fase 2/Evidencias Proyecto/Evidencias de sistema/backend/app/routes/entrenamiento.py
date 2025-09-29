from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/Entrenamiento", tags=["Entrenamientos"])


@router.post("/", response_model=schemas.EntrenamientoRead)
def create_entrenamiento(
    entrenamiento: schemas.EntrenamientoCreate, db: Session = Depends(get_db)
):
    return services.create_entrenamiento(db, entrenamiento)


@router.get("/{id_entrenamiento}", response_model=schemas.EntrenamientoRead)
def get_entrenamiento(id_entrenamiento: int, db: Session = Depends(get_db)):
    db_entrenamiento = services.get_entrenamiento(db, id_entrenamiento)
    if db_entrenamiento is None:
        raise HTTPException(status_code=404, detail="Entrenamiento not found")
    return db_entrenamiento


@router.get("/", response_model=list[schemas.EntrenamientoRead])
def get_entrenamientos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    entrenamientos = services.get_entrenamientos(db, skip=skip, limit=limit)
    return entrenamientos


@router.put("/{id_entrenamiento}", response_model=schemas.EntrenamientoRead)
def update_entrenamiento(
    id_entrenamiento: int,
    entrenamiento: schemas.EntrenamientoUpdate,
    db: Session = Depends(get_db),
):
    db_entrenamiento = services.update_entrenamiento(
        db, id_entrenamiento, entrenamiento
    )
    if db_entrenamiento is None:
        raise HTTPException(status_code=404, detail="Entrenamiento not found")
    return db_entrenamiento


@router.delete("/{id_entrenamiento}", response_model=dict)
def delete_entrenamiento(id_entrenamiento: int, db: Session = Depends(get_db)):
    success = services.delete_entrenamiento(db, id_entrenamiento)
    if not success:
        raise HTTPException(status_code=404, detail="Entrenamiento not found")
    return {"detail": "Entrenamiento deleted successfully"}
