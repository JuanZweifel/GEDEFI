from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/reuniones", tags=["Reuniones"])


@router.post("/", response_model=schemas.ReunionRead)
def create_reunion(reunion: schemas.ReunionCreate, db: Session = Depends(get_db)):
    try:
        return services.create_reunion(db, reunion)
    except HTTPException as e:
        raise e


@router.get("/{reunion_id}", response_model=schemas.ReunionRead)
def read_reunion(reunion_id: int, db: Session = Depends(get_db)):
    try:
        return services.get_reunion(db, reunion_id)
    except HTTPException as e:
        raise e


@router.get("/", response_model=list[schemas.ReunionRead])
def read_reuniones(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        return services.get_reuniones(db, skip=skip, limit=limit)
    except HTTPException as e:
        raise e


@router.put("/{reunion_id}", response_model=schemas.ReunionRead)
def update_reunion(
    reunion_id: int, reunion: schemas.ReunionUpdate, db: Session = Depends(get_db)
):
    try:
        return services.update_reunion(db, reunion_id, reunion)
    except HTTPException as e:
        raise e


@router.delete("/{reunion_id}", status_code=204)
def delete_reunion(reunion_id: int, db: Session = Depends(get_db)):
    try:
        return services.delete_reunion(db, reunion_id)
    except HTTPException as e:
        raise e
