from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/club", tags=["Club"])


@router.post("/", response_model=schemas.ClubRead)
def create_club(club: schemas.ClubCreate, db: Session = Depends(get_db)):
    try:
        return services.create_club(db, club)
    except HTTPException as e:
        raise e


@router.get("/{id_club}", response_model=schemas.ClubRead)
def get_club(id_club: int, db: Session = Depends(get_db)):
    try:
        db_club = services.get_club(db, id_club)
        return db_club
    except HTTPException as e:
        raise e

@router.get("/", response_model=list[schemas.ClubWithDetails])
def get_club_with_details(db: Session = Depends(get_db)):
    try:
        return services.get_club_with_details(db)
    except HTTPException as e:
        raise e


@router.put("/{id_club}", response_model=schemas.ClubRead)
def update_club(id_club: int, club: schemas.ClubUpdate, db: Session = Depends(get_db)):
    try:
        db_club = services.get_club(db, id_club)
        if db_club is None:
            raise HTTPException(status_code=404, detail="Club not found.")
        return services.update_club(db, id_club, club)
    except HTTPException as e:
        raise e


@router.delete("/{id_club}")
def delete_club(id_club: int, db: Session = Depends(get_db)):
    try:
        return services.delete_club(db, id_club)
    except HTTPException as e:
        raise e


