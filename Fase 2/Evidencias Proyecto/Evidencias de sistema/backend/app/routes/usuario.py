from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/usuarios", tags=["Usuario"])


@router.post("/", response_model=schemas.UsuarioRead)
def create_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    return services.create_usuario(db, usuario)


@router.get("/{rut_usu}", response_model=schemas.UsuarioRead)
def get_usuario(rut_usu: str, db: Session = Depends(get_db)):
    db_usuario = services.get_usuario(db, rut_usu)
    if db_usuario is None:
        raise HTTPException(status_code=404, detail="Usuario not found.")
    return db_usuario


@router.get("/", response_model=list[schemas.UsuarioRead])
def get_usuarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_usuarios(db, skip=skip, limit=limit)


@router.put("/{rut_usu}", response_model=schemas.UsuarioRead)
def update_usuario(
    rut_usu: str, usuario: schemas.UsuarioUpdate, db: Session = Depends(get_db)
):
    db_usuario = services.get_usuario(db, rut_usu)
    if db_usuario is None:
        raise HTTPException(status_code=404, detail="Usuario not found.")
    return services.update_usuario(db, rut_usu, usuario)


@router.delete("/{rut_usu}")
def delete_usuario(rut_usu: str, db: Session = Depends(get_db)):
    db_usuario = services.get_usuario(db, rut_usu)
    if db_usuario is None:
        raise HTTPException(status_code=404, detail="Usuario not found.")

    if services.delete_usuario(db, rut_usu):
        return {"detail": "Usuario deleted successfully."}
    else:
        raise HTTPException(status_code=500, detail="Error deleting usuario.")
