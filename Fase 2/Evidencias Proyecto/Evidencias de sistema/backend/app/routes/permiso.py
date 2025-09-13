from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/permisos", tags=["Permiso"])


@router.post("/", response_model=schemas.PermisoRead)
def create_permiso(permiso: schemas.PermisoCreate, db: Session = Depends(get_db)):
    return services.create_permiso(db, permiso)


@router.get("/{id_permiso}", response_model=schemas.PermisoRead)
def get_permiso(id_permiso: int, db: Session = Depends(get_db)):
    db_permiso = services.get_permiso(db, id_permiso)
    if db_permiso is None:
        raise HTTPException(status_code=404, detail="Permiso not found.")
    return db_permiso


@router.get("/", response_model=list[schemas.PermisoRead])
def get_permisos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_permisos(db, skip=skip, limit=limit)


@router.put("/{id_permiso}", response_model=schemas.PermisoRead)
def update_permiso(
    id_permiso: int, permiso: schemas.PermisoUpdate, db: Session = Depends(get_db)
):
    db_permiso = services.get_permiso(db, id_permiso)
    if db_permiso is None:
        raise HTTPException(status_code=404, detail="Permiso not found.")
    return services.update_permiso(db, id_permiso, permiso)


@router.delete("/{id_permiso}")
def delete_permiso(id_permiso: int, db: Session = Depends(get_db)):
    db_permiso = services.get_permiso(db, id_permiso)
    if db_permiso is None:
        raise HTTPException(status_code=404, detail="Permiso not found.")

    if services.delete_permiso(db, id_permiso):
        return {"detail": "Permiso deleted successfully."}
    else:
        raise HTTPException(status_code=500, detail="Error deleting permiso.")
