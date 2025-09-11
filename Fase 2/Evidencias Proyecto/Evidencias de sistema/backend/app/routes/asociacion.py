from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/Asociaciones", tags=["Asociaciones"])


@router.post("/", response_model=schemas.AsociacionRead)
def create_asociacion(
    asociacion: schemas.AsociacionCreate, db: Session = Depends(get_db)
):
    return services.create_asociacion(db, asociacion)


@router.get("/{asociacion_id}", response_model=schemas.AsociacionRead)
def read_asociacion(asociacion_id: int, db: Session = Depends(get_db)):
    db_asociacion = services.get_asociacion(db, asociacion_id)
    if db_asociacion is None:
        raise HTTPException(status_code=404, detail="Asociacion not found")
    return db_asociacion


@router.get("/", response_model=list[schemas.AsociacionRead])
def read_asociaciones(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_asociaciones(db, skip=skip, limit=limit)


@router.put("/{asociacion_id}", response_model=schemas.AsociacionRead)
def update_asociacion(
    asociacion_id: int,
    asociacion: schemas.AsociacionUpdate,
    db: Session = Depends(get_db),
):
    db_asociacion = services.get_asociacion(db, asociacion_id)
    if db_asociacion is None:
        raise HTTPException(status_code=404, detail="Asociacion not found")
    return services.update_asociacion(db, asociacion_id, asociacion)


@router.delete("/{asociacion_id}")
def delete_asociacion(asociacion_id: int, db: Session = Depends(get_db)):
    db_asociacion = services.get_asociacion(db, asociacion_id)
    if db_asociacion is None:
        raise HTTPException(status_code=404, detail="Asociacion not found")

    if services.delete_asociacion(db, asociacion_id):
        return {"detail": "association deleted successfully."}
    else:
        raise HTTPException(status_code=500, detail="Error deleting association.")
