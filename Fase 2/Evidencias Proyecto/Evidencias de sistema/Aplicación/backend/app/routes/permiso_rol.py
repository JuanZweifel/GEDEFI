# routers/permiso_rol.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/PermisoRol", tags=["Permisos Roles"])


@router.post("/", response_model=schemas.PermisoRolRead)
def create_permiso_rol(
    permiso_rol: schemas.PermisoRolCreate, db: Session = Depends(get_db)
):
    return services.create_permiso_rol(db, permiso_rol)


# TODO: No me convence el nombre del endpoint
@router.post("/multiple/{id_rol}", response_model=list[schemas.PermisoRolRead])
def create_multiple_permisos_rol(
    id_rol: int, permisos_ids: list[int], db: Session = Depends(get_db)
):
    return services.create_permisos_roles(db, id_rol, permisos_ids)


@router.get("/rol/{id_rol}", response_model=list[schemas.PermisoRolRead])
def get_permisos_de_rol(id_rol: int, db: Session = Depends(get_db)):
    return services.get_permisos_de_rol(db, id_rol)


@router.get("/permiso/{id_permiso}", response_model=list[schemas.PermisoRolRead])
def get_roles_de_permiso(id_permiso: int, db: Session = Depends(get_db)):
    return services.get_roles_de_permiso(db, id_permiso)


@router.get(
    "/{fecha_ini_permiso_rol}/{id_rol}/{id_permiso}",
    response_model=schemas.PermisoRolRead,
)
def get_permiso_rol(
    fecha_ini_permiso_rol: str,
    id_rol: int,
    id_permiso: int,
    db: Session = Depends(get_db),
):
    try:
        fecha = datetime.fromisoformat(fecha_ini_permiso_rol)
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de fecha incorrecto")
    db_permiso_rol = services.get_permiso_rol(db, fecha, id_rol, id_permiso)
    if not db_permiso_rol:
        raise HTTPException(status_code=404, detail="PermisoRol not found")
    return db_permiso_rol


@router.put(
    "/{fecha_ini_permiso_rol}/{id_rol}/{id_permiso}",
    response_model=schemas.PermisoRolRead,
)
def update_permiso_rol(
    fecha_ini_permiso_rol: str,
    id_rol: int,
    id_permiso: int,
    permiso_rol: schemas.PermisoRolUpdate,
    db: Session = Depends(get_db),
):
    try:
        fecha = datetime.fromisoformat(fecha_ini_permiso_rol)
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de fecha incorrecto")
    db_permiso_rol = services.update_permiso_rol(
        db, fecha, id_rol, id_permiso, permiso_rol
    )
    if not db_permiso_rol:
        raise HTTPException(status_code=404, detail="PermisoRol not found")
    return db_permiso_rol


@router.delete("/{fecha_ini_permiso_rol}/{id_rol}/{id_permiso}", response_model=dict)
def delete_permiso_rol(
    fecha_ini_permiso_rol: str,
    id_rol: int,
    id_permiso: int,
    db: Session = Depends(get_db),
):
    try:
        fecha = datetime.fromisoformat(fecha_ini_permiso_rol)
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de fecha incorrecto")
    success = services.delete_permiso_rol(db, fecha, id_rol, id_permiso)
    if not success:
        raise HTTPException(status_code=404, detail="PermisoRol not found")
    return {"detail": "PermisoRol deleted successfully"}
