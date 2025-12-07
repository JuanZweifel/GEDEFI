from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas
from app.security import get_current_user

router = APIRouter(prefix="/rendimientos-partido", tags=["Rendimientos Partido"])

# Obtener todos los rendimientos (con paginación opcional)
@router.get("/{id_partido}")
def read_rendimientos_partido(id_partido: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return services.get_rendimientos_partido(id_partido, db, current_user)

# Actualizar rendimiento partido
@router.put("/{id_partido}")
def update_rendimiento_partido(rendimientos: list[schemas.RendimientoPartidoUpdate], id_partido: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db_rendimiento = services.update_rendimiento_partido(db,current_user, id_partido, rendimientos)
    if not db_rendimiento:
        raise HTTPException(status_code=404, detail="Rendimiento partido not found")
    return {"message": "Rendimientos actualizados correctamente"}

# Eliminar rendimiento partido
@router.delete("/{rut_jugador}/{id_serie}/{id_partido}", status_code=204)
def delete_rendimiento_partido(rut_jugador: str, id_serie: int, id_partido: int, db: Session = Depends(get_db)):
    deleted = services.delete_rendimiento_partido(db, rut_jugador, id_serie, id_partido)
    if not deleted:
        raise HTTPException(status_code=404, detail="Rendimiento partido not found")