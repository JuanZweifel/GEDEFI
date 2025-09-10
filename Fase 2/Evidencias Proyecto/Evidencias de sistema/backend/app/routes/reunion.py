from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/reuniones", tags=["Reuniones"])


@router.post("/", response_model=schemas.ReunionRead)
def create_reunion(reunion: schemas.ReunionCreate, db: Session = Depends(get_db)):
    return services.create_reunion(db, reunion)


@router.get("/{reunion_id}", response_model=schemas.ReunionRead)
def read_reunion(reunion_id: int, db: Session = Depends(get_db)):
    db_reunion = services.get_reunion(db, reunion_id)
    if not db_reunion:
        raise HTTPException(status_code=404, detail="Reunion not found")
    return db_reunion


@router.get("/", response_model=list[schemas.ReunionRead])
def read_reuniones(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_reuniones(db, skip=skip, limit=limit)


@router.put("/{reunion_id}", response_model=schemas.ReunionRead)
def update_reunion(
    reunion_id: int, reunion: schemas.ReunionUpdate, db: Session = Depends(get_db)
):
    db_reunion = services.update_reunion(db, reunion_id, reunion)
    if not db_reunion:
        raise HTTPException(status_code=404, detail="Reunion not found")
    return db_reunion


@router.delete("/{reunion_id}", status_code=204)
def delete_reunion(reunion_id: int, db: Session = Depends(get_db)):
    deleted = services.delete_reunion(db, reunion_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Reunion not found")
