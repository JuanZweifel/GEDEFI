from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/Contrato-club", tags=["Contratos Club"])


@router.post("/", response_model=schemas.ContratoClubRead)
def create_asociacion(
    contrato_club: schemas.ContratoClubCreate, db: Session = Depends(get_db)
):
    return services.create_contrato_club(db, contrato_club)


@router.get(
    "/asociacion-{id_asociacion}/club-{id_club}",
    response_model=schemas.ContratoClubRead,
)
def get_contrato_club(id_asociacion: int, id_club: int, db: Session = Depends(get_db)):
    db_contrato_club = services.get_contrato_club(db, id_asociacion, id_club)
    if db_contrato_club is None:
        raise HTTPException(status_code=404, detail="Club contract not found.")
    return db_contrato_club


@router.get("/", response_model=list[schemas.ContratoClubRead])
def get_contratos_club(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_contratos_club(db, skip=skip, limit=limit)


@router.put(
    "/asociacion-{id_asociacion}/club-{id_club}",
    response_model=schemas.ContratoClubRead,
)
def update_contrato_club(
    id_asociacion: int,
    id_club: int,
    contrato_club: schemas.ContratoClubUpdate,
    db: Session = Depends(get_db),
):
    db_contrato_club = services.get_contrato_club(db, id_asociacion, id_club)
    if db_contrato_club is None:
        raise HTTPException(status_code=404, detail="Club contract not found.")
    return services.update_contrato_club(db, id_asociacion, id_club, contrato_club)


@router.delete("/asociacion-{id_asociacion}/club-{id_club}")
def delete_contrato_club(
    id_asociacion: int, id_club: int, db: Session = Depends(get_db)
):
    db_contrato_club = services.get_contrato_club(db, id_asociacion, id_club)
    if db_contrato_club is None:
        raise HTTPException(status_code=404, detail="Club contract not found.")

    if services.delete_contrato_club(db, id_asociacion, id_club):
        return {"detail": "club contract deleted successfully."}
    else:
        raise HTTPException(status_code=500, detail="Error deleting club contract.")
