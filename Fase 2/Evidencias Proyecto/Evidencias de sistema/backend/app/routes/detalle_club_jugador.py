from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/detalle_club_jugador", tags=["Detalle Club Jugador"])

# Crear detalle club jugador
@router.post("/", response_model=schemas.DetalleClubJugadorRead)
def create_detalle_club_jugador(detalle: schemas.DetalleClubJugadorCreate, db: Session = Depends(get_db)):
    return services.create_detalle_club_jugador(db, detalle)

# Obtener detalle por rut_jugador e id_club
@router.get("/{rut_jugador}/{id_club}", response_model=schemas.DetalleClubJugadorRead)
def read_detalle_club_jugador(rut_jugador: str, id_club: int, db: Session = Depends(get_db)):
    db_detalle = services.get_detalle_club_jugador(db, rut_jugador, id_club)
    if not db_detalle:
        raise HTTPException(status_code=404, detail="Detalle club jugador not found")
    return db_detalle

# Obtener todos los detalles (con paginación opcional)
@router.get("/", response_model=list[schemas.DetalleClubJugadorRead])
def read_detalles_club_jugador(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_detalles_club_jugador(db, skip=skip, limit=limit)

# Actualizar detalle club jugador
@router.put("/{rut_jugador}/{id_club}", response_model=schemas.DetalleClubJugadorRead)
def update_detalle_club_jugador(rut_jugador: str, id_club: int, detalle: schemas.DetalleClubJugadorUpdate, db: Session = Depends(get_db)):
    db_detalle = services.update_detalle_club_jugador(db, rut_jugador, id_club, detalle)
    if not db_detalle:
        raise HTTPException(status_code=404, detail="Detalle club jugador not found")
    return db_detalle

# Eliminar detalle club jugador
@router.delete("/{rut_jugador}/{id_club}", status_code=204)
def delete_detalle_club_jugador(rut_jugador: str, id_club: int, db: Session = Depends(get_db)):
    deleted = services.delete_detalle_club_jugador(db, rut_jugador, id_club)
    if not deleted:
        raise HTTPException(status_code=404, detail="Detalle club jugador not found")