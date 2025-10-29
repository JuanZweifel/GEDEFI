from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/canchas", tags=["Canchas"])

# Crear cancha
@router.post("/", response_model=schemas.CanchaRead)
def create_cancha(cancha: schemas.CanchaCreate, db: Session = Depends(get_db)):
    return services.create_cancha(db, cancha)

# Obtener cancha por id
@router.get("/{cancha_id}", response_model=schemas.CanchaRead)
def read_cancha(cancha_id: int, db: Session = Depends(get_db)):
    db_cancha = services.get_cancha(db, cancha_id)
    if not db_cancha:
        raise HTTPException(status_code=404, detail="Cancha not found")
    return db_cancha

# Obtener todas las canchas
@router.get("/", response_model=list[schemas.CanchaRead])
def read_canchas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_canchas(db, skip=skip, limit=limit)

# Actualizar cancha
@router.put("/{cancha_id}", response_model=schemas.CanchaRead)
def update_cancha(cancha_id: int, cancha: schemas.CanchaUpdate, db: Session = Depends(get_db)):
    db_cancha = services.update_cancha(db, cancha_id, cancha)
    if not db_cancha:
        raise HTTPException(status_code=404, detail="Cancha not found")
    return db_cancha

# Eliminar cancha
@router.delete("/{cancha_id}", status_code=200)
def delete_cancha(cancha_id: int, db: Session = Depends(get_db)):
    try:
        message = services.delete_cancha(db, cancha_id)
        return {"detail": message}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=404, detail="Cancha not found")

# Reactivar cancha
@router.post("/{cancha_id}/reactivate", status_code=200)
def reactivate_cancha(cancha_id: int, db: Session = Depends(get_db)):
    db_cancha = services.reactivate_cancha(db, cancha_id)
    if not db_cancha:
        raise HTTPException(status_code=404, detail="Cancha no encontrada")
    return {"detail": "Cancha reactivada correctamente"}
