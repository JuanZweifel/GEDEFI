from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/fichas_jugador", tags=["Fichas Jugador"])

# Crear ficha jugador
@router.post("/", response_model=schemas.FichaJugadorRead)
def create_ficha_jugador(ficha: schemas.FichaJugadorCreate, db: Session = Depends(get_db)):
    return services.create_ficha_jugador(db, ficha)

# Obtener ficha por rut_jugador e id_serie
@router.get("/{rut_jugador}/{id_serie}", response_model=schemas.FichaJugadorRead)
def read_ficha_jugador(rut_jugador: str, id_serie: int, db: Session = Depends(get_db)):
    db_ficha = services.get_ficha_jugador(db, rut_jugador, id_serie)
    if not db_ficha:
        raise HTTPException(status_code=404, detail="Ficha jugador not found")
    return db_ficha

# Obtener todas las fichas (con paginación opcional)
@router.get("/", response_model=list[schemas.FichaJugadorRead])
def read_fichas_jugador(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_fichas_jugador(db, skip=skip, limit=limit)

# Actualizar ficha jugador
@router.put("/{rut_jugador}/{id_serie}", response_model=schemas.FichaJugadorRead)
def update_ficha_jugador(rut_jugador: str, id_serie: int, ficha: schemas.FichaJugadorUpdate, db: Session = Depends(get_db)):
    db_ficha = services.update_ficha_jugador(db, rut_jugador, id_serie, ficha)
    if not db_ficha:
        raise HTTPException(status_code=404, detail="Ficha jugador not found")
    return db_ficha

# Eliminar ficha jugador
@router.delete("/{rut_jugador}/{id_serie}", status_code=204)
def delete_ficha_jugador(rut_jugador: str, id_serie: int, db: Session = Depends(get_db)):
    deleted = services.delete_ficha_jugador(db, rut_jugador, id_serie)
    if not deleted:
        raise HTTPException(status_code=404, detail="Ficha jugador not found")