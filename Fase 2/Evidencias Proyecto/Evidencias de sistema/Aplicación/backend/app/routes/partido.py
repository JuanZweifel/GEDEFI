from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas
from app.security import get_current_user

router = APIRouter(prefix="/partidos", tags=["Partidos"])


# Crear partido
@router.post("/")
def create_partido(partido: schemas.PartidoCreate, db: Session = Depends(get_db)):
    services.create_partido(db, partido)
    return {"message": "Partido creado exitosamente"}


# Obtener partido por id
@router.get("/{partido_id}", response_model=schemas.PartidoRead)
def read_partido(partido_id: int, db: Session = Depends(get_db)):
    db_partido = services.get_partido(db, partido_id)
    if not db_partido:
        raise HTTPException(status_code=404, detail="Partido not found")
    return db_partido


# Obtener todos los partidos
@router.get("/")
def read_partidos(skip: int = 0, limit: int = 20, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return services.get_partidos(db, current_user, skip=skip, limit=limit)


# Actualizar partido
@router.put("/{partido_id}")
def update_partido(
    partido_id: int, partido: schemas.PartidoUpdate, db: Session = Depends(get_db)
):
    db_partido = services.update_partido(db, partido_id, partido)
    if not db_partido:
        raise HTTPException(status_code=404, detail="Partido not found")
    return {"message": "Partido modificado correctamente"}


# Eliminar partido
@router.delete("/{partido_id}", status_code=204)
def delete_partido(partido_id: int, db: Session = Depends(get_db)):
    deleted = services.delete_partido(db, partido_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Partido not found")
    return {"message": "Partido eliminado correctamente"}

@router.get("/partidos/{id_serie}", response_model=list[schemas.PartidoRead])
def get_partidos_by_serie(id_serie: int, db: Session = Depends(get_db)):
    try:
        return services.get_partidos_by_serie(db, id_serie)
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

