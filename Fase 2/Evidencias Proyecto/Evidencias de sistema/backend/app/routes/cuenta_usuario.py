from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/cuentas-usuarios", tags=["Cuenta Usuario"])


@router.post("/", response_model=schemas.CuentaUsuarioRead)
def create_cuenta_usuario(
    cuenta_usuario: schemas.CuentaUsuarioCreate, db: Session = Depends(get_db)
):
    return services.create_cuenta_usuario(db, cuenta_usuario)


@router.get("/{correo_usu}", response_model=schemas.CuentaUsuarioRead)
def get_cuenta_usuario(correo_usu: str, db: Session = Depends(get_db)):
    db_cuenta_usuario = services.get_cuenta_usuario(db, correo_usu)
    if db_cuenta_usuario is None:
        raise HTTPException(status_code=404, detail="Cuenta usuario not found.")
    return db_cuenta_usuario


@router.get("/", response_model=list[schemas.CuentaUsuarioRead])
def get_cuentas_usuario(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_cuentas_usuario(db, skip=skip, limit=limit)


@router.put("/{correo_usu}", response_model=schemas.CuentaUsuarioRead)
def update_cuenta_usuario(
    correo_usu: str,
    cuenta_usuario: schemas.CuentaUsuarioUpdate,
    db: Session = Depends(get_db),
):
    db_cuenta_usuario = services.get_cuenta_usuario(db, correo_usu)
    if db_cuenta_usuario is None:
        raise HTTPException(status_code=404, detail="Cuenta usuario not found.")
    return services.update_cuenta_usuario(db, correo_usu, cuenta_usuario)


@router.delete("/{correo_usu}")
def delete_cuenta_usuario(correo_usu: str, db: Session = Depends(get_db)):
    db_cuenta_usuario = services.get_cuenta_usuario(db, correo_usu)
    if db_cuenta_usuario is None:
        raise HTTPException(status_code=404, detail="Cuenta usuario not found.")

    if services.delete_cuenta_usuario(db, correo_usu):
        return {"detail": "Cuenta-usuario deleted successfully."}
    else:
        raise HTTPException(status_code=500, detail="Error deleting cuenta usuario.")
