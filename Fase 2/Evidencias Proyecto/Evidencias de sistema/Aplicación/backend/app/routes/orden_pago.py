from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas
from app.security import get_current_user

router = APIRouter(prefix="/ordenes-pago", tags=["Orden Pago"])


@router.post("/")
def create_orden_pago(
    orden_pago: schemas.OrdenPagoCreate, db: Session = Depends(get_db) #current_user: dict = Depends(get_current_user)
):
    try:
        flag = services.create_orden_pago(db, orden_pago, {"rut_usuario" : "26836282-7"})
        return {"message": "¡Orden creada correctamente!"}
    except HTTPException as e:
        raise e


@router.get("/{id_orden}", response_model=schemas.OrdenPagoRead)
def get_orden_pago(id_orden: int, db: Session = Depends(get_db)):
    try:
        return services.get_orden_pago(db, id_orden)
    except HTTPException as e:
        raise e


@router.get("/", response_model=list[schemas.OrdenPagoRead])
def get_ordenes_pago(db: Session = Depends(get_db)):
    try:
        return services.get_ordenes_pago(db)
    except HTTPException as e:
        raise e


@router.delete("/{id_orden}")
def delete_orden_pago(id_orden: int, db: Session = Depends(get_db)):
    try:
        return services.delete_orden_pago(db, id_orden)
    except HTTPException as e:
        raise e
