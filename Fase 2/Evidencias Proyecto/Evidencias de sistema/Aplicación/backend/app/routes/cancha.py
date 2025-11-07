from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas
from app.security import get_current_user

router = APIRouter(prefix="/canchas", tags=["Canchas"])


# Crear cancha
@router.post("/", response_model=schemas.CanchaRead)
def create_cancha(
    cancha: schemas.CanchaCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return services.create_cancha(db, cancha, current_user=current_user)


# Obtener cancha por id
@router.get("/{cancha_id}", response_model=schemas.CanchaRead)
def read_cancha(
    cancha_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    db_cancha = services.get_cancha(db, cancha_id, current_user=current_user)
    if not db_cancha:
        raise HTTPException(status_code=404, detail="Cancha not found")
    return db_cancha


# Obtener todas las canchas
@router.get("/", response_model=list[schemas.CanchaRead])
def read_canchas(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return services.get_canchas(db, current_user=current_user, skip=skip, limit=limit)


# Actualizar cancha
@router.put("/{cancha_id}", response_model=schemas.CanchaRead)
def update_cancha(
    cancha_id: int,
    cancha: schemas.CanchaUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    db_cancha = services.update_cancha(db, cancha_id, cancha, current_user=current_user)
    if not db_cancha:
        raise HTTPException(status_code=404, detail="Cancha not found")
    return db_cancha


# Eliminar cancha
@router.delete("/{cancha_id}", status_code=200)
def delete_cancha(
    cancha_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    try:
        message = services.delete_cancha(db, cancha_id, current_user=current_user)
        return {"detail": message}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=404, detail="Cancha not found")


# Reactivar cancha
@router.post("/{cancha_id}/reactivate", status_code=200)
def reactivate_cancha(
    cancha_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    db_cancha = services.reactivate_cancha(db, cancha_id, current_user=current_user)
    if not db_cancha:
        raise HTTPException(status_code=404, detail="Cancha no encontrada")
    return {"detail": "Cancha reactivada correctamente"}
