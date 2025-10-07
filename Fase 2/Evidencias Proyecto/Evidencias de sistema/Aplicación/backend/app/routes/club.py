from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/clubs", tags=["Club"])



@router.post("/")
def create_club(club: schemas.ClubCreate, db: Session = Depends(get_db)):
    try:
        flag = services.create_club(db, club)

        if(flag):
            return {"message": "¡Club creado exitosamente!"}
    except HTTPException as e:
        raise e


@router.get("/{id_club}", response_model=schemas.ClubRead)
def get_club(id_club: int, db: Session = Depends(get_db)):
    try:
        db_club = services.get_club(db, id_club)
        return db_club
    except HTTPException as e:
        raise e

@router.get("/{id_club}/series", response_model=schemas.SerieList)
def get_series_club(id_club: int, db: Session = Depends(get_db)):
    try:
        return services.get_series_club(db, id_club=id_club)
    except HTTPException as e:
        raise e

@router.get("/{id_club}/jugadores", response_model=schemas.JugadorList)
def get_players_club(id_club: int, db: Session = Depends(get_db)):
    try:
        return services.get_players_club(db, id_club=id_club)
    except HTTPException as e:
        raise e

@router.get("/{id_club}/usuarios", response_model=schemas.UsuarioList)
def get_users_club(id_club: int, db: Session = Depends(get_db)):
    try:
        return services.get_users_club(db, id_club=id_club)
    except HTTPException as e:
        raise e

@router.get("/", response_model=list[schemas.ClubWithDetails])
def get_club_with_details(db: Session = Depends(get_db)):
    try:
        return services.get_club_with_details(db)
    except HTTPException as e:
        raise e


@router.put("/{id_club}")
def update_club(id_club: int, club: schemas.ClubUpdate, db: Session = Depends(get_db)):
    try:
        flag = services.update_club(db, id_club, club)
        if(flag):
            return {"message": "¡Club modificado correctamente!"}
        else:
            return {"message": "Error: No se encontro el club a modificar."}
    except HTTPException as e:
        raise e


@router.delete("/{id_club}")
def delete_club(id_club: int, db: Session = Depends(get_db)):
    try:
        flag = services.delete_club(db, id_club)
        if(flag):
            return {"message": "¡Club eliminado correctamente!"}
    except HTTPException as e:
        raise e


