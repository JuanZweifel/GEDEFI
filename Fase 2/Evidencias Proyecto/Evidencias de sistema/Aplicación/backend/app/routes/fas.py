from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas
from app.security import get_current_user

router = APIRouter(prefix="/fas", tags=["Fondo de Ayuda Solidaria"])


@router.post("/", response_model=schemas.FASRead)
def create_fas(
    fas: schemas.FASCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Crea un nuevo fondo FAS (solo un administrador debería poder hacerlo).
    """
    nuevo_fas = services.create_fas(db, fas)
    return nuevo_fas


@router.get("/{id_fas}", response_model=schemas.FASRead)
def read_fas(id_fas: int, db: Session = Depends(get_db)):
    """
    Obtiene un fondo FAS por su ID.
    """
    db_fas = services.get_fas(db, id_fas)
    if not db_fas:
        raise HTTPException(status_code=404, detail="Fondo FAS no encontrado")
    return db_fas


@router.get("/", response_model=list[schemas.FASRead])
def read_fondos_fas(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Lista todos los fondos FAS disponibles (puedes filtrar por año si quieres).
    """
    fas_list = services.get_fondos_fas(db, skip=skip, limit=limit)
    return fas_list


@router.put("/{id_fas}", response_model=schemas.FASRead)
def update_fas(
    id_fas: int,
    fas_update: schemas.FASUpdate,
    db: Session = Depends(get_db),
):
    """
    Actualiza un fondo FAS existente.
    """
    db_fas = services.update_fas(db, id_fas, fas_update)
    if not db_fas:
        raise HTTPException(status_code=404, detail="Fondo FAS no encontrado")
    return db_fas


@router.delete("/{id_fas}", status_code=204)
def delete_fas(id_fas: int, db: Session = Depends(get_db)):
    """
    Elimina un fondo FAS por su ID.
    """
    deleted = services.delete_fas(db, id_fas)
    if not deleted:
        raise HTTPException(status_code=404, detail="Fondo FAS no encontrado")