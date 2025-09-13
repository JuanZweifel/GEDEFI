from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/Serie", tags=["Series"])


@router.post("/", response_model=schemas.SerieRead)
def create_serie(serie: schemas.SerieCreate, db: Session = Depends(get_db)):
    return services.create_serie(db, serie)


@router.get("/{id_serie}", response_model=schemas.SerieRead)
def get_serie(id_serie: int, db: Session = Depends(get_db)):
    db_serie = services.get_serie(db, id_serie)
    if db_serie is None:
        raise HTTPException(status_code=404, detail="Serie not found.")
    return db_serie


@router.get("/", response_model=list[schemas.SerieRead])
def get_series(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_series(db, skip=skip, limit=limit)


@router.delete("/{id_serie}")
def delete_serie(id_serie: int, db: Session = Depends(get_db)):
    db_serie = services.get_serie(db, id_serie)
    if db_serie is None:
        raise HTTPException(status_code=404, detail="Serie not found.")

    if services.delete_serie(db, id_serie):
        return {"detail": "Serie deleted successfully."}
    else:
        raise HTTPException(status_code=500, detail="Error deleting serie.")
