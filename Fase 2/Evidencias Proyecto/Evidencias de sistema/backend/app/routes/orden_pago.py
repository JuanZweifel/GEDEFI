from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas

router = APIRouter(prefix="/ordenes-pago", tags=["Orden Pago"])


@router.post("/", response_model=schemas.OrdenPagoRead)
def create_orden_pago(
    orden_pago: schemas.OrdenPagoCreate, db: Session = Depends(get_db)
):
    return services.create_orden_pago(db, orden_pago)


@router.get("/{id_orden}", response_model=schemas.OrdenPagoRead)
def get_orden_pago(id_orden: int, db: Session = Depends(get_db)):
    db_orden_pago = services.get_orden_pago(db, id_orden)
    if db_orden_pago is None:
        raise HTTPException(status_code=404, detail="Orden de pago not found.")
    return db_orden_pago


@router.get("/", response_model=list[schemas.OrdenPagoRead])
def get_ordenes_pago(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_ordenes_pago(db, skip=skip, limit=limit)


@router.delete("/{id_orden}")
def delete_orden_pago(id_orden: int, db: Session = Depends(get_db)):
    db_orden_pago = services.get_orden_pago(db, id_orden)
    if db_orden_pago is None:
        raise HTTPException(status_code=404, detail="Orden de pago not found.")

    if services.delete_orden_pago(db, id_orden):
        return {"detail": "Orden de pago deleted successfully."}
    else:
        raise HTTPException(status_code=500, detail="Error deleting orden de pago.")
