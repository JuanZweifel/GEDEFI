from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/club", tags=["Club"])


@router.post("/", response_model=schemas.ClubRead)
def create_club(club: schemas.ClubCreate, db: Session = Depends(get_db)):
    return services.create_club(db, club)


@router.get("/{id_club}", response_model=schemas.ClubRead)
def get_club(id_club: int, db: Session = Depends(get_db)):
    db_club = services.get_club(db, id_club)
    if db_club is None:
        raise HTTPException(status_code=404, detail="Club not found.")
    return db_club


@router.get("/", response_model=list[schemas.ClubRead])
def get_clubs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_clubs(db, skip=skip, limit=limit)


@router.put("/{id_club}", response_model=schemas.ClubRead)
def update_club(id_club: int, club: schemas.ClubUpdate, db: Session = Depends(get_db)):
    db_club = services.get_club(db, id_club)
    if db_club is None:
        raise HTTPException(status_code=404, detail="Club not found.")
    return services.update_club(db, id_club, club)


@router.delete("/{id_club}")
def delete_club(id_club: int, db: Session = Depends(get_db)):
    db_club = services.get_club(db, id_club)
    if db_club is None:
        raise HTTPException(status_code=404, detail="Club not found.")

    if services.delete_club(db, id_club):
        return {"detail": "Club deleted successfully."}
    else:
        raise HTTPException(status_code=500, detail="Error deleting club.")
