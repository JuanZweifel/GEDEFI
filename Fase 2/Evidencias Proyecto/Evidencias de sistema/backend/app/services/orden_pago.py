from sqlalchemy.orm import Session
from app.models import OrdenPago
from app.schemas import OrdenPagoCreate, OrdenPagoUpdate


def get_orden_pago(db: Session, id_orden: int) -> OrdenPago | None:
    return db.query(OrdenPago).filter(OrdenPago.id_orden == id_orden).first()


def get_ordenes_pago(db: Session, skip: int = 0, limit: int = 100):
    return db.query(OrdenPago).offset(skip).limit(limit).all()


def create_orden_pago(db: Session, orden_pago: OrdenPagoCreate) -> OrdenPago:
    db_orden_pago = OrdenPago(**orden_pago.dict())
    db.add(db_orden_pago)
    db.commit()
    db.refresh(db_orden_pago)
    return db_orden_pago


def update_orden_pago(
    db: Session, id_orden: int, orden_pago_update: OrdenPagoUpdate
) -> OrdenPago | None:
    db_orden_pago = get_orden_pago(db, id_orden)
    if not db_orden_pago:
        return None
    for key, value in orden_pago_update.dict(exclude_unset=True).items():
        setattr(db_orden_pago, key, value)
    db.commit()
    db.refresh(db_orden_pago)
    return db_orden_pago


def delete_orden_pago(db: Session, id_orden: int) -> bool:
    db_orden_pago = get_orden_pago(db, id_orden)
    if not db_orden_pago:
        return False
    db.delete(db_orden_pago)
    db.commit()
    return True
