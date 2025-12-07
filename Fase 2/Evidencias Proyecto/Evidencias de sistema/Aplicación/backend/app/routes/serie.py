from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db import get_db
from app.security import get_current_user
from app import services, schemas

router = APIRouter(prefix="/series", tags=["Series"])

@router.get("/")
def get_series_with_details(
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user),
    search: str | None = Query(None, description="Buscar por nombre, rut o email"),
    estado: int | None = Query(None, description="1=activos, 2=inactivos"),
    skip: int | None = Query(None, ge=0),
    limit: int | None = Query(None, ge=1, le=20)
):
    try:
        # Administradores pueden solicitar con paginación y filtros
        return services.get_series_with_details(
            db,
            current_user,
            search=search,
            estado=estado,
            skip=skip,
            limit=limit,
        )
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    

@router.put("/{id_serie}")
def update_state_serie(id_serie: int, db:Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    try:
        info = services.update_state_serie(db, id_serie, current_user)
        return {"message": f"Serie {'activada correctamente!' if info else 'desactivada correctamente'}"}
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    

@router.get("/unicas", response_model=list[schemas.SerieUniqueRead])
def list_series_unicas(db: Session = Depends(get_db)):
    """
    Obtiene todas las series únicas (sin repetir nombres).
    """
    try:
        return services.get_unique_series(db)
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)