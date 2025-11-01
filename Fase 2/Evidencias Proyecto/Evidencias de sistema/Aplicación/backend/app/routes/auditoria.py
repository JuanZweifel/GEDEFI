from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db import get_db
from app.security import get_current_user
from app import services, schemas
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/auditorias", tags=["Auditorias"])


@router.get("/", response_model=list[schemas.AuditoriaRead])
def get_auditorias(
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    accion_realizada: Optional[str] = Query(None),
    recurso: Optional[str] = Query(None),
    fecha_ini: Optional[datetime] = Query(None),
    fecha_fin: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    return services.get_auditorias(
        db=db,
        current_user=current_user,
        skip=skip,
        limit=limit,
        accion_realizada=accion_realizada,
        recurso=recurso,
        fecha_ini=fecha_ini,
        fecha_fin=fecha_fin,
    )

@router.get("/resumen", response_model=schemas.ResumenAuditoria)
def get_resumen_auditoria(db: Session = Depends(get_db)):
    return services.get_resumen_auditoria(db) #CURRENT_USER

@router.get("/{id_auditoria}", response_model=schemas.AuditoriaRead)
def get_auditoria(id_auditoria: int, db: Session = Depends(get_db)):
    db_auditoria = services.get_auditoria(db, id_auditoria)
    if db_auditoria is None:
        raise HTTPException(status_code=404, detail="Auditoria not found")
    return db_auditoria