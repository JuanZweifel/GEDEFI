from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas
from app.models import DetalleClubJugador
from app.security import get_current_user

router = APIRouter(prefix="/uso_fas", tags=["Usos del Fondo FAS"])


@router.post("/", response_model=schemas.UsoFASRead)
def create_uso_fas(
    uso_fas: schemas.UsoFASCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Registra un nuevo uso del fondo FAS por un jugador.
    """
    # Validar que el jugador pertenezca al mismo club del usuario
    detalle = db.query(DetalleClubJugador).filter(
        DetalleClubJugador.rut_jugador == uso_fas.rut_jugador,
        DetalleClubJugador.id_club == current_user["id_club"]
    ).first()

    if not detalle:
        raise HTTPException(
            status_code=403,
            detail="No puedes registrar usos del FAS para jugadores de otro club."
        )

    nuevo_uso = services.create_uso_fas(db, uso_fas)
    return nuevo_uso


@router.get("/{id_uso_fas}", response_model=schemas.UsoFASWithDetails)
def read_uso_fas(id_uso_fas: int, db: Session = Depends(get_db)):
    """
    Obtiene un uso del FAS por su ID.
    """
    db_uso = services.get_uso_fas(db, id_uso_fas)
    if not db_uso:
        raise HTTPException(status_code=404, detail="Uso FAS no encontrado")
    return db_uso


@router.get("/", response_model=list[schemas.UsoFASWithDetails])
def read_usos_fas(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Lista todos los usos del FAS de los jugadores del club del usuario logeado.
    """
    # Obtener los RUTs de los jugadores del club del usuario
    ruts_club = (
        db.query(DetalleClubJugador.rut_jugador)
        .filter(DetalleClubJugador.id_club == current_user["id_club"])
        .all()
    )
    ruts_club = [r[0] for r in ruts_club]

    usos = (
        db.query(schemas.UsoFAS.model_config["orm_model"])
        .filter(schemas.UsoFAS.model_config["orm_model"].rut_jugador.in_(ruts_club))
        .offset(skip)
        .limit(limit)
        .all()
    )

    return usos


@router.put("/{id_uso_fas}", response_model=schemas.UsoFASRead)
def update_uso_fas(
    id_uso_fas: int,
    uso_update: schemas.UsoFASUpdate,
    db: Session = Depends(get_db),
):
    """
    Actualiza un registro de uso del fondo FAS.
    """
    db_uso = services.update_uso_fas(db, id_uso_fas, uso_update)
    if not db_uso:
        raise HTTPException(status_code=404, detail="Uso FAS no encontrado")
    return db_uso


@router.delete("/{id_uso_fas}", status_code=204)
def delete_uso_fas(id_uso_fas: int, db: Session = Depends(get_db)):
    """
    Elimina un uso del fondo FAS y devuelve el monto al fondo.
    """
    deleted = services.delete_uso_fas(db, id_uso_fas)
    if not deleted:
        raise HTTPException(status_code=404, detail="Uso FAS no encontrado")
    