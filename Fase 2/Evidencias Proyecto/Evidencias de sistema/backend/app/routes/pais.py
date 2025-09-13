from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/Pais", tags=["Paises"])

@router.post("/", response_model=schemas.PaisRead)
def create_pais(pais: schemas.PaisCreate, db: Session = Depends(get_db)):
    return services.create_pais(db, pais)

@router.get("/{id_pais}", response_model=schemas.PaisRead)
def get_pais(id_pais: int, db: Session = Depends(get_db)):
    db_pais = services.get_pais(db, id_pais)
    if db_pais is None:
        raise HTTPException(status_code=404, detail="Country not found.")
    return db_pais

@router.get("/", response_model=list[schemas.PaisRead])
def get_paises(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_paises(db, skip=skip, limit=limit)

@router.put("/{id_pais}", response_model=schemas.PaisRead)
def update_pais(id_pais: int, pais: schemas.PaisUpdate, db: Session = Depends(get_db)):
    db_pais = services.get_pais(db, id_pais)
    if db_pais is None:
        raise HTTPException(status_code=404, detail="Country not found.")
    return services.update_pais(db, id_pais, pais)

@router.delete("/{id_pais}")
def delete_pais(id_pais: int, db: Session = Depends(get_db)):
    db_pais = services.get_pais(db, id_pais)
    if db_pais is None:
        raise HTTPException(status_code=404, detail="Country not found.")

    if services.delete_pais(db, id_pais):
        return {"detail": "Country deleted successfully."}
    else:
        raise HTTPException(status_code=500, detail="Error deleting country.")

