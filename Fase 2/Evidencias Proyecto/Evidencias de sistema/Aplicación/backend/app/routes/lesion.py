from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/lesiones", tags=["Lesiones"])


@router.post("/", response_model=schemas.LesionRead)
def create_lesion(lesion: schemas.LesionCreate, db: Session = Depends(get_db)):
    return services.create_lesion(db, lesion)


@router.get("/{id_lesion}", response_model=schemas.LesionRead)
def read_lesion(id_lesion: int, db: Session = Depends(get_db)):
    db_lesion = services.get_lesion(db, id_lesion)
    if not db_lesion:
        raise HTTPException(status_code=404, detail="Lesion not found")
    return db_lesion


@router.get("/", response_model=list[schemas.LesionRead])
def read_lesiones(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_lesiones(db, skip=skip, limit=limit)


@router.put("/{id_lesion}", response_model=schemas.LesionRead)
def update_lesion(
    id_lesion: int, lesion: schemas.LesionUpdate, db: Session = Depends(get_db)
):
    db_lesion = services.update_lesion(db, id_lesion, lesion)
    if not db_lesion:
        raise HTTPException(status_code=404, detail="Lesion not found")
    return db_lesion


@router.delete("/{id_lesion}", status_code=204)
def delete_lesion(id_lesion: int, db: Session = Depends(get_db)):
    deleted = services.delete_lesion(db, id_lesion)
    if not deleted:
        raise HTTPException(status_code=404, detail="Lesion not found")