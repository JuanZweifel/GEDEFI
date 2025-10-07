from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


@router.post("/", response_model=schemas.UsuarioRead)
def create_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    return services.create_usuario(db, usuario)


@router.get("/{rut_usuario}", response_model=schemas.UsuarioRead)
def get_usuario(rut_usuario: str, db: Session = Depends(get_db)):
    db_usuario = services.get_usuario(db, rut_usuario)
    if db_usuario is None:
        raise HTTPException(status_code=404, detail="Usuario not found")
    return db_usuario


@router.get("/", response_model=list[schemas.UsuarioRead])
def get_usuarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    usuarios = services.get_usuarios(db, skip=skip, limit=limit)
    return usuarios


@router.put("/{rut_usuario}", response_model=schemas.UsuarioRead)
def update_usuario(
    rut_usuario: str, usuario: schemas.UsuarioUpdate, db: Session = Depends(get_db)
):
    db_usuario = services.update_usuario(db, rut_usuario, usuario)
    if db_usuario is None:
        raise HTTPException(status_code=404, detail="Usuario not found")
    return db_usuario


@router.delete("/{rut_usuario}", response_model=dict)
def delete_usuario(rut_usuario: str, db: Session = Depends(get_db)):
    success = services.delete_usuario(db, rut_usuario)
    if not success:
        raise HTTPException(status_code=404, detail="Usuario not found")
    return {"detail": "Usuario Eliminado correctamente"}
