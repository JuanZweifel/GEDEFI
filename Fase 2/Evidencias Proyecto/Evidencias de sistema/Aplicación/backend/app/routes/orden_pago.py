from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas
from app.security import get_current_user

router = APIRouter(prefix="/ordenes-pago", tags=["Orden Pago"])


@router.post("/")
def create_orden_pago(
    orden_pago: schemas.OrdenPagoCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    try:
        flag = services.create_orden_pago(db, orden_pago,  current_user)
        return {"message": "¡Orden creada correctamente!"}
    except HTTPException as e:
        raise e

@router.get("/ingresos-mes", response_model=schemas.IngresosMes)
def obtener_ingresos_mes(
    db: Session = Depends(get_db),
    #current_user: dict = Depends(get_current_user)
):
    return services.get_ingresos(db) #current_user)

@router.get("/egresos-mes", response_model=schemas.EgresosMes)
def obtener_egresos_mes(
    db: Session = Depends(get_db),
    #current_user: dict = Depends(get_current_user)
):
    return services.get_egresos(db) #current_user)

@router.get("/{id_orden}", response_model=schemas.OrdenPagoRead)
def get_orden_pago(id_orden: str, db: Session = Depends(get_db)):
    try:
        return services.get_orden_pago(db, id_orden)
    except HTTPException as e:
        raise e


@router.get("/", response_model=list[schemas.OrdenPagoRead])
def get_ordenes_pago(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    try:
        return services.get_ordenes_pago(db, current_user)
    except HTTPException as e:
        raise e


@router.delete("/{id_orden}")
def delete_orden_pago(id_orden: str, db: Session = Depends(get_db)):
    try:
        return services.delete_orden_pago(db, id_orden)
    except HTTPException as e:
        raise e

@router.put("/{id_orden}/anular")
def cancel_orden(id_orden: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    try:
        estado = services.cancel_orden(db, id_orden, current_user)

        return {"message": f"Orden {estado.value.capitalize()} correctamente"}
    except HTTPException as e:
        raise e

@router.put("/{id_orden}/pay")
def pay_orden(id_orden: str, orden: schemas.OrdenPagoPay, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    try:
        estado = services.pay_orden(db, id_orden, orden, current_user)

        return {"message": f"Orden marcada como {estado.value.capitalize()} correctamente"}
    except HTTPException as e:
        raise e
    
@router.put("/{id_orden}/pending")
def pending_orden(id_orden: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    try:
        services.pending_orden(db, id_orden, current_user)
        return {"message": "Orden marcada como pendiente correctamente"}
    except HTTPException as e:
        raise e