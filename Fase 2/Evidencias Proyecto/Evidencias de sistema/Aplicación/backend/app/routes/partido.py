from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/partidos", tags=["Partidos"])

# Crear partido
@router.post("/", response_model=schemas.PartidoRead)
def create_partido(partido: schemas.PartidoCreate, db: Session = Depends(get_db)):
    return services.create_partido(db, partido)

# Obtener partido por id
@router.get("/{partido_id}", response_model=schemas.PartidoRead)
def read_partido(partido_id: int, db: Session = Depends(get_db)):
    db_partido = services.get_partido(db, partido_id)
    if not db_partido:
        raise HTTPException(status_code=404, detail="Partido not found")
    return db_partido

# Obtener todos los partidos
@router.get("/", response_model=list[schemas.PartidoRead])
def read_partidos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_partidos(db, skip=skip, limit=limit)

# Actualizar partido
@router.put("/{partido_id}", response_model=schemas.PartidoRead)
def update_partido(partido_id: int, partido: schemas.PartidoUpdate, db: Session = Depends(get_db)):
    db_partido = services.update_partido(db, partido_id, partido)
    if not db_partido:
        raise HTTPException(status_code=404, detail="Partido not found")
    return db_partido

# Eliminar partido
@router.delete("/{partido_id}", status_code=204)
def delete_partido(partido_id: int, db: Session = Depends(get_db)):
    deleted = services.delete_partido(db, partido_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Partido not found")