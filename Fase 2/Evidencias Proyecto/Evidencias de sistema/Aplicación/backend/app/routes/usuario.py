from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.db import get_db
from app import services, schemas
from app.security import get_current_user

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


@router.post("/", response_model=schemas.UsuarioRead)
def create_usuario(
    usuario: schemas.UsuarioCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return services.create_usuario(db, usuario, current_user)


@router.get("/{rut_usuario}", response_model=schemas.UsuarioRead)
def get_usuario(
    rut_usuario: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    db_usuario = services.get_usuario(db, rut_usuario, current_user=current_user)
    if db_usuario is None:
        raise HTTPException(status_code=404, detail="Usuario not found")
    return db_usuario


@router.get("/", response_model=schemas.PaginatedUsuarios)
def get_usuarios(
    skip: int = 0,
    limit: int = 100,
    estado: Optional[int] = None,
    club: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    usuarios = services.get_usuarios(
        db,
        skip=skip,
        limit=limit,
        current_user=current_user,
        estado=estado,
        club=club,
        search=search,
    )
    return usuarios


@router.put("/{rut_usuario}", response_model=schemas.UsuarioRead)
def update_usuario(
    rut_usuario: str,
    usuario: schemas.UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    db_usuario = services.update_usuario(db, rut_usuario, usuario, current_user)
    if db_usuario is None:
        raise HTTPException(status_code=404, detail="Usuario not found")
    return db_usuario


@router.delete("/{rut_usuario}")
def delete_usuario(
    rut_usuario: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    success = services.delete_usuario(db, rut_usuario, current_user)
    if not success:
        raise HTTPException(status_code=404, detail="Usuario not found")
    return {"detail": "Usuario Eliminado correctamente"}


@router.get("/{rut_usuario}/active", response_model=bool)
def is_user_active(
    rut_usuario: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    is_active = services.is_user_active(db, rut_usuario)
    if not is_active:
        return True
    raise HTTPException(status_code=404, detail="User not found or inactive")
