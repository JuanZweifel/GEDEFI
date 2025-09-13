from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/Ficha-Jugador", tags=["Fichas de jugadores"])

@router.post("/", response_model=schemas.FichaJugadorRead)
def create_ficha_jugador(
    ficha_jugador: schemas.FichaJugadorCreate, db: Session = Depends(get_db)
):
    return services.create_ficha_jugador(db, ficha_jugador)

@router.get("/{rut_jugador}", response_model=schemas.FichaJugadorRead)
def get_ficha_jugador(rut_jugador: str, db: Session = Depends(get_db)):
    db_ficha_jugador = services.get_ficha_jugador(db, rut_jugador)
    if db_ficha_jugador is None:
        raise HTTPException(status_code=404, detail="Player record not found.")
    return db_ficha_jugador

@router.get("/", response_model=list[schemas.FichaJugadorRead])
def get_fichas_jugadores(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_fichas_jugadores(db, skip=skip, limit=limit)

@router.put("/{rut_jugador}", response_model=schemas.FichaJugadorRead)
def update_ficha_jugador(
    rut_jugador: str,
    ficha_jugador: schemas.FichaJugadorUpdate,
    db: Session = Depends(get_db),
):
    db_ficha_jugador = services.get_ficha_jugador(db, rut_jugador)
    if db_ficha_jugador is None:
        raise HTTPException(status_code=404, detail="Player record not found.")
    return services.update_ficha_jugador(db, rut_jugador, ficha_jugador)

@router.delete("/{rut_jugador}")
def delete_ficha_jugador(rut_jugador: str, db: Session = Depends(get_db)):
    db_ficha_jugador = services.get_ficha_jugador(db, rut_jugador)
    if db_ficha_jugador is None:
        raise HTTPException(status_code=404, detail="Player record not found.")

    if services.delete_ficha_jugador(db, rut_jugador):
        return {"detail": "Player record deleted successfully."}
    else:
        raise HTTPException(status_code=500, detail="Error deleting player record.")


