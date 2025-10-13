from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/series", tags=["Series"])


@router.post("/")
def create_serie(serie: schemas.SerieCreate, db: Session = Depends(get_db)):
    try:
        return {"message": "¡Serie creada exitosamente!"} if services.create_serie(db, serie=serie) else {}
    except HTTPException as e:
        raise HTTPException(e.status_code, detail=e.detail) from e


@router.get("/{id_serie}", response_model=schemas.SerieRead)
def get_serie(id_serie: int, db: Session = Depends(get_db)):
    db_serie = services.get_serie(db, id_serie)
    if db_serie is None:
        raise HTTPException(status_code=404, detail="Serie not found.")
    return db_serie

@router.delete("/{id_serie}")
def delete_serie(id_serie: int, db: Session = Depends(get_db)):
    try:
        db_serie = services.get_serie(db, id_serie)
        if db_serie is None:
            raise HTTPException(status_code=404, detail="Serie no encontrada")

        if services.delete_serie(db, id_serie):
            return {"message": "Serie eliminada correctamente"}
        else:
            raise HTTPException(status_code=500, detail="Error deleting serie.")
    except HTTPException as e:
        raise e from e

@router.get("/", response_model=list[schemas.SerieWithDetails])
def get_series_with_details(db: Session = Depends(get_db)):
    try:
        info = services.get_series_with_details(db)
        return info
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    
@router.put("/{id_serie}")
def update_state_serie(id_serie: int, serieUpdate: schemas.SerieUpdate, db:Session = Depends(get_db)):
    try:
        info = services.update_state_serie(db, id_serie, serieUpdate)
        return {"message": f"Serie {'activada correctamente!' if serieUpdate.state else 'desactivada correctamente'}"}
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)