from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/Auditoria", tags=["Auditorias"])


@router.get("/{id_auditoria}", response_model=schemas.AuditoriaRead)
def get_auditoria(id_auditoria: int, db: Session = Depends(get_db)):
    db_auditoria = services.get_auditoria(db, id_auditoria)
    if db_auditoria is None:
        raise HTTPException(status_code=404, detail="Auditoria not found")
    return db_auditoria


@router.get("/", response_model=list[schemas.AuditoriaRead])
def get_auditorias(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_auditorias(db, skip=skip, limit=limit)
