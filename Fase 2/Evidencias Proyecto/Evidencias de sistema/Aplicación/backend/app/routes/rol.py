from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/roles", tags=["Roles"])


@router.post("/", response_model=schemas.RolRead)
def create_rol(rol: schemas.RolCreate, db: Session = Depends(get_db)):
    return services.create_rol(db, rol)


@router.get("/{id_rol}", response_model=schemas.RolRead)
def get_rol(id_rol: int, db: Session = Depends(get_db)):
    db_rol = services.get_rol(db, id_rol)
    if db_rol is None:
        raise HTTPException(status_code=404, detail="Rol not found")
    return db_rol


@router.get("/", response_model=list[schemas.RolRead])
def get_roles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    roles = services.get_roles(db, skip=skip, limit=limit)
    return roles


@router.put("/{id_rol}", response_model=schemas.RolRead)
def update_rol(id_rol: int, rol: schemas.RolUpdate, db: Session = Depends(get_db)):
    db_rol = services.update_rol(db, id_rol, rol)
    if db_rol is None:
        raise HTTPException(status_code=404, detail="Rol not found")
    return db_rol


@router.delete("/{id_rol}", response_model=dict)
def delete_rol(id_rol: int, db: Session = Depends(get_db)):
    success = services.delete_rol(db, id_rol)
    if not success:
        raise HTTPException(status_code=404, detail="Rol not found")
    return {"detail": "Rol deleted successfully"}
