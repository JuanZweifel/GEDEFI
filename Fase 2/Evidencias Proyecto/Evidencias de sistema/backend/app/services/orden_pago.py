from sqlalchemy.orm import Session
from app.models import OrdenPago
from app.schemas import OrdenPagoCreate
from sqlalchemy.exc import SQLAlchemyError, NoResultFound, IntegrityError
from fastapi import HTTPException


def get_orden_pago(db: Session, id_orden: int) -> OrdenPago | None:
    try:
        return db.query(OrdenPago).filter(OrdenPago.id_orden_pago == id_orden).first()
    except NoResultFound as e:
        raise HTTPException(status_code=404, detail="Orden de pago no encontrada") from e

def get_ordenes_pago(db: Session, skip: int = 0, limit: int = 100):
    try:
        return db.query(OrdenPago).offset(skip).limit(limit).all()
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail="Error interno del servidor") from e


def create_orden_pago(db: Session, orden_pago: OrdenPagoCreate) -> OrdenPago:
    try:
        db_orden_pago = OrdenPago(**orden_pago.model_dump(mode="json"))
        db.add(db_orden_pago)
        db.commit()
        db.refresh(db_orden_pago)
        return db_orden_pago
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error de integridad en la base de datos.") from e
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error interno del servidor") from e


def delete_orden_pago(db: Session, id_orden: int) -> dict:
    try:
        db_orden_pago = get_orden_pago(db, id_orden)
        db.delete(db_orden_pago)
        db.commit()
        return {"details": "Orden de pago eliminada exitosamente."}
    except (SQLAlchemyError, HTTPException) as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error interno del servidor") from e
