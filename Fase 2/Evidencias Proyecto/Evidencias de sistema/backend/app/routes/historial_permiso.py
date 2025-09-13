from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/historial-permisos", tags=["Historial Permiso"])


@router.post("/", response_model=schemas.HistorialPermisoRead)
def create_historial_permiso(
    historial_permiso: schemas.HistorialPermisoCreate, db: Session = Depends(get_db)
):
    return services.create_historial_permiso(db, historial_permiso)


@router.get(
    "/{id_historial_permiso}/{correo_usu}/{id_permiso}",
    response_model=schemas.HistorialPermisoRead,
)
def get_historial_permiso(
    id_historial_permiso: int,
    correo_usu: str,
    id_permiso: int,
    db: Session = Depends(get_db),
):
    db_historial_permiso = services.get_historial_permiso(
        db, id_historial_permiso, correo_usu, id_permiso
    )
    if db_historial_permiso is None:
        raise HTTPException(status_code=404, detail="Historial Permiso not found.")
    return db_historial_permiso


@router.get("/", response_model=list[schemas.HistorialPermisoRead])
def get_historiales_permiso(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    return services.get_historiales_permiso(db, skip=skip, limit=limit)


@router.put(
    "/{id_historial_permiso}/{correo_usu}/{id_permiso}",
    response_model=schemas.HistorialPermisoRead,
)
def update_historial_permiso(
    id_historial_permiso: int,
    correo_usu: str,
    id_permiso: int,
    historial_permiso: schemas.HistorialPermisoUpdate,
    db: Session = Depends(get_db),
):
    db_historial_permiso = services.get_historial_permiso(
        db, id_historial_permiso, correo_usu, id_permiso
    )
    if db_historial_permiso is None:
        raise HTTPException(status_code=404, detail="Historial Permiso not found.")
    return services.update_historial_permiso(
        db, id_historial_permiso, correo_usu, id_permiso, historial_permiso
    )


@router.delete("/{id_historial_permiso}/{correo_usu}/{id_permiso}")
def delete_historial_permiso(
    id_historial_permiso: int,
    correo_usu: str,
    id_permiso: int,
    db: Session = Depends(get_db),
):
    db_historial_permiso = services.get_historial_permiso(
        db, id_historial_permiso, correo_usu, id_permiso
    )
    if db_historial_permiso is None:
        raise HTTPException(status_code=404, detail="Historial Permiso not found.")

    if services.delete_historial_permiso(
        db, id_historial_permiso, correo_usu, id_permiso
    ):
        return {"detail": "Historial Permiso deleted successfully."}
    else:
        raise HTTPException(status_code=500, detail="Error deleting Historial Permiso.")
