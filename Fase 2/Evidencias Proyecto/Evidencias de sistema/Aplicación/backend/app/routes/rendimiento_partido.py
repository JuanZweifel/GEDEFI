from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/rendimientos-partido", tags=["Rendimientos Partido"])

# Obtener rendimiento por jugador, serie y partido
@router.get("/{id_club}/{id_partido}", response_model=list[schemas.RendimientoPartidoRead])
def read_rendimiento_partido(id_club:int, id_partido: int, db: Session = Depends(get_db)):
    db_rendimiento = services.get_rendimientos_partido_club(db, id_club, id_partido)
    if not db_rendimiento:
        raise HTTPException(status_code=404, detail="Rendimiento partido not found")
    return db_rendimiento

# Obtener todos los rendimientos (con paginación opcional)
@router.get("/", response_model=list[schemas.RendimientoPartidoRead])
def read_rendimientos_partido(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_rendimientos_partido(db, skip=skip, limit=limit)

# Actualizar rendimiento partido
@router.put("/{rut_jugador}/{id_serie}/{id_partido}", response_model=schemas.RendimientoPartidoRead)
def update_rendimiento_partido(rut_jugador: str, id_serie: int, id_partido: int, rendimiento: schemas.RendimientoPartidoUpdate, db: Session = Depends(get_db)):
    db_rendimiento = services.update_rendimiento_partido(db, rut_jugador, id_serie, id_partido, rendimiento)
    if not db_rendimiento:
        raise HTTPException(status_code=404, detail="Rendimiento partido not found")
    return db_rendimiento

# Eliminar rendimiento partido
@router.delete("/{rut_jugador}/{id_serie}/{id_partido}", status_code=204)
def delete_rendimiento_partido(rut_jugador: str, id_serie: int, id_partido: int, db: Session = Depends(get_db)):
    deleted = services.delete_rendimiento_partido(db, rut_jugador, id_serie, id_partido)
    if not deleted:
        raise HTTPException(status_code=404, detail="Rendimiento partido not found")