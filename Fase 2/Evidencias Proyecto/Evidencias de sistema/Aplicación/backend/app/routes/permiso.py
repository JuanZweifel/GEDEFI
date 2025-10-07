from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/Permiso", tags=["Permisos"])


@router.post("/", response_model=schemas.PermisoRead)
def create_permiso(permiso: schemas.PermisoCreate, db: Session = Depends(get_db)):
    return services.create_permiso(db, permiso)


@router.get("/{id_permiso}", response_model=schemas.PermisoRead)
def get_permiso(id_permiso: int, db: Session = Depends(get_db)):
    db_permiso = services.get_permiso(db, id_permiso)
    if not db_permiso:
        raise HTTPException(status_code=404, detail="Permiso not found")
    return db_permiso


@router.get("/", response_model=list[schemas.PermisoRead])
def get_permisos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_permisos(db, skip=skip, limit=limit)


@router.put("/{id_permiso}", response_model=schemas.PermisoRead)
def update_permiso(
    id_permiso: int, permiso: schemas.PermisoUpdate, db: Session = Depends(get_db)
):
    db_permiso = services.update_permiso(db, id_permiso, permiso)
    if not db_permiso:
        raise HTTPException(status_code=404, detail="Permiso not found")
    return db_permiso


@router.delete("/{id_permiso}", response_model=dict)
def delete_permiso(id_permiso: int, db: Session = Depends(get_db)):
    success = services.delete_permiso(db, id_permiso)
    if not success:
        raise HTTPException(status_code=404, detail="Permiso not found")
    return {"detail": "Permiso deleted successfully"}
