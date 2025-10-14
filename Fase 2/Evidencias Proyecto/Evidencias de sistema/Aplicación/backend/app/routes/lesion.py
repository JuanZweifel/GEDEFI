from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas
from app.models import Usuario, DetalleClubJugador, Lesion
from app.security import get_current_user
from app.schemas import LesionCreate, LesionRead

router = APIRouter(prefix="/lesiones", tags=["Lesiones"])


@router.post("/")
def create_lesion(
    lesion: LesionCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)  
):
    detalle = db.query(DetalleClubJugador).filter(
        DetalleClubJugador.rut_jugador == lesion.rut_jugador,
        DetalleClubJugador.id_club == current_user["club_id"]  # acceder como dict
    ).first()

    if not detalle:
        raise HTTPException(
            status_code=403,
            detail="No puedes agregar lesiones a jugadores de otro club"
        )

    nueva_lesion = Lesion(
        rut_jugador=lesion.rut_jugador,
        nombre_lesion=lesion.nombre_lesion,
        tipo_lesion=lesion.tipo_lesion,
        descripcion=lesion.descripcion,
        fecha_lesion=lesion.fecha_lesion,
        tiempo_recuperacion=lesion.tiempo_recuperacion,
        fecha_fin_lesion=lesion.fecha_fin_lesion,
    )
    db.add(nueva_lesion)
    db.commit()
    db.refresh(nueva_lesion)
    return nueva_lesion


@router.get("/{id_lesion}", response_model=schemas.LesionRead)
def read_lesion(id_lesion: int, db: Session = Depends(get_db)):
    db_lesion = services.get_lesion(db, id_lesion)
    if not db_lesion:
        raise HTTPException(status_code=404, detail="Lesion not found")
    return db_lesion


@router.get("/", response_model=list[LesionRead])
def read_lesiones(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)  # token decodificado
):
    # Obtener los RUTs de los jugadores que pertenecen al club del usuario logeado
    ruts_club = (
        db.query(DetalleClubJugador.rut_jugador)
        .filter(DetalleClubJugador.id_club == current_user["club_id"])
        .all()
    )
    # ruts_club es lista de tuplas, convertir a lista simple
    ruts_club = [r[0] for r in ruts_club]

    lesiones = (
        db.query(Lesion)
        .filter(Lesion.rut_jugador.in_(ruts_club))
        .offset(skip)
        .limit(limit)
        .all()
    )

    return lesiones


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