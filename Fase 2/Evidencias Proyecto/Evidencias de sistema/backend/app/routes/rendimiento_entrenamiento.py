from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/rendimientos_entrenamiento", tags=["Rendimientos Entrenamiento"])

# Crear rendimiento entrenamiento
@router.post("/", response_model=schemas.RendimientoEntrenamientoRead)
def create_rendimiento_entrenamiento(rendimiento: schemas.RendimientoEntrenamientoCreate, db: Session = Depends(get_db)):
    return services.create_rendimiento_entrenamiento(db, rendimiento)

# Obtener rendimiento por jugador y entrenamiento
@router.get("/{rut_jugador}/{id_entrenamiento}", response_model=schemas.RendimientoEntrenamientoRead)
def read_rendimiento_entrenamiento(rut_jugador: str, id_entrenamiento: int, db: Session = Depends(get_db)):
    db_rendimiento = services.get_rendimiento_entrenamiento(db, rut_jugador, id_entrenamiento)
    if not db_rendimiento:
        raise HTTPException(status_code=404, detail="Rendimiento entrenamiento not found")
    return db_rendimiento

# Obtener todos los rendimientos (opcional paginación)
@router.get("/", response_model=list[schemas.RendimientoEntrenamientoRead])
def read_rendimientos_entrenamiento(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_rendimientos_entrenamiento(db, skip=skip, limit=limit)

# Actualizar rendimiento entrenamiento
@router.put("/{rut_jugador}/{id_entrenamiento}", response_model=schemas.RendimientoEntrenamientoRead)
def update_rendimiento_entrenamiento(rut_jugador: str, id_entrenamiento: int, rendimiento: schemas.RendimientoEntrenamientoUpdate, db: Session = Depends(get_db)):
    db_rendimiento = services.update_rendimiento_entrenamiento(db, rut_jugador, id_entrenamiento, rendimiento)
    if not db_rendimiento:
        raise HTTPException(status_code=404, detail="Rendimiento entrenamiento not found")
    return db_rendimiento

# Eliminar rendimiento entrenamiento
@router.delete("/{rut_jugador}/{id_entrenamiento}", status_code=204)
def delete_rendimiento_entrenamiento(rut_jugador: str, id_entrenamiento: int, db: Session = Depends(get_db)):
    deleted = services.delete_rendimiento_entrenamiento(db, rut_jugador, id_entrenamiento)
    if not deleted:
        raise HTTPException(status_code=404, detail="Rendimiento entrenamiento not found")