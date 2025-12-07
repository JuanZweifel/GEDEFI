from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/Archivo", tags=["Archivos"])


@router.post("/", response_model=schemas.ArchivoRead)
def create_archivo(archivo: schemas.ArchivoCreate, db: Session = Depends(get_db)):
    return services.create_archivo(db, archivo)


@router.get("/{id_archivo}", response_model=schemas.ArchivoRead)
def get_archivo(id_archivo: int, db: Session = Depends(get_db)):
    db_archivo = services.get_archivo(db, id_archivo)
    if db_archivo is None:
        raise HTTPException(status_code=404, detail="Archivo not found")
    return db_archivo


@router.get("/", response_model=list[schemas.ArchivoRead])
def get_archivos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_archivos(db, skip=skip, limit=limit)


@router.put("/{id_archivo}", response_model=schemas.ArchivoRead)
def update_archivo(
    id_archivo: int, archivo: schemas.ArchivoUpdate, db: Session = Depends(get_db)
):
    db_archivo = services.update_archivo(db, id_archivo, archivo)
    if db_archivo is None:
        raise HTTPException(status_code=404, detail="Archivo not found")
    return db_archivo


@router.delete("/{id_archivo}", response_model=dict)
def delete_archivo(id_archivo: int, db: Session = Depends(get_db)):
    success = services.delete_archivo(db, id_archivo)
    if not success:
        raise HTTPException(status_code=404, detail="Archivo not found")
    return {"detail": "Archivo deleted successfully"}
