from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.security import get_current_user
from app import services, schemas

router = APIRouter(prefix="/series", tags=["Series"])

@router.get("/", response_model=list[schemas.SerieWithDetails])
def get_series_with_details(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    try:
        info = services.get_series_with_details(db, current_user)
        return info
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    

@router.put("/{id_serie}")
def update_state_serie(id_serie: int, db:Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    try:
        info = services.update_state_serie(db, id_serie, current_user)
        return {"message": f"Serie {'activada correctamente!' if info else 'desactivada correctamente'}"}
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    

@router.get("/unicas", response_model=list[schemas.SerieUniqueRead])
def list_series_unicas(db: Session = Depends(get_db)):
    """
    Obtiene todas las series únicas (sin repetir nombres).
    """
    try:
        return services.get_unique_series(db)
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)