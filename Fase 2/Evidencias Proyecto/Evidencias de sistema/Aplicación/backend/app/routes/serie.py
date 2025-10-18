from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.security import get_current_user
from app import services, schemas

router = APIRouter(prefix="/series", tags=["Series"])

@router.get("/{id_serie}", response_model=schemas.SerieRead)
def get_serie(id_serie: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db_serie = services.get_serie(db, id_serie)
    if db_serie is None:
        raise HTTPException(status_code=404, detail="Serie not found.")
    return db_serie

@router.delete("/{id_serie}")
def delete_serie(id_serie: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    try:
        db_serie = services.get_serie(db, id_serie)
        if db_serie is None:
            raise HTTPException(status_code=404, detail="Serie no encontrada")

        if services.delete_serie(db, id_serie, current_user):
            return {"message": "Serie eliminada correctamente"}
        else:
            raise HTTPException(status_code=500, detail="Error deleting serie.")
    except HTTPException as e:
        raise e from e

@router.get("/", response_model=list[schemas.SerieWithDetails])
def get_series_with_details(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    try:
        info = services.get_series_with_details(db, current_user)
        return info
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    
@router.put("/{id_serie}")
def update_state_serie(id_serie: int, serieUpdate: schemas.SerieUpdate, db:Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    try:
        info = services.update_state_serie(db, id_serie, serieUpdate, current_user)
        return {"message": f"Serie {'activada correctamente!' if serieUpdate.state else 'desactivada correctamente'}"}
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)