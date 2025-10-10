from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/jugadores", tags=["Jugadores"])


@router.post("/", response_model=schemas.JugadorRead)
def create_jugador(jugador: schemas.JugadorCreate, db: Session = Depends(get_db)):
    try:
        return services.create_jugador(db, jugador)
    except HTTPException:
        # Permite que los HTTPException lleguen al cliente tal cual
        raise
    except Exception as e:
        # Cualquier otro error será 500
        raise HTTPException(status_code=500, detail=f"Error al crear jugador: {str(e)}")


@router.get("/{rut_jugador}", response_model=schemas.JugadorRead)
def read_jugador(rut_jugador: str, db: Session = Depends(get_db)):
    db_jugador = services.get_jugador(db, rut_jugador)
    if not db_jugador:
        raise HTTPException(status_code=404, detail="Jugador not found")
    return db_jugador


@router.get("/", response_model=list[schemas.JugadorRead])
def read_jugadores(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_jugadores(db, skip=skip, limit=limit)


@router.put("/{rut_jugador}", response_model=schemas.JugadorRead)
def update_jugador(
    rut_jugador: str, jugador: schemas.JugadorUpdate, db: Session = Depends(get_db)
):
    db_jugador = services.update_jugador(db, rut_jugador, jugador)
    if not db_jugador:
        raise HTTPException(status_code=404, detail="Jugador not found")
    return db_jugador


@router.delete("/{rut_jugador}", status_code=204)
def delete_jugador(rut_jugador: str, db: Session = Depends(get_db)):
    deleted = services.delete_jugador(db, rut_jugador)
    if not deleted:
        raise HTTPException(status_code=404, detail="Jugador not found")