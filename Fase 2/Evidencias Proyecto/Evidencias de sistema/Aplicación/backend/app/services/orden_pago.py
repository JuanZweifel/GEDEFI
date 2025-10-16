from sqlalchemy.orm import Session
from app.models import OrdenPago, Usuario, Club
from app.schemas import OrdenPagoCreate, OrdenPagoRead
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, Depends

from app.utils.decorators import handle_db_exceptions
from app.security import get_current_user

@handle_db_exceptions
def get_orden_pago(db: Session, id_orden: int, current_user: Usuario = Depends(get_current_user)) -> OrdenPago | None:
    return db.query(OrdenPago).filter(OrdenPago.id_orden_pago == id_orden).first()

@handle_db_exceptions
def get_ordenes_pago(db: Session, current_user: Usuario = Depends(get_current_user)):
    db_ordenes = db.query(OrdenPago).all()
    if not db_ordenes: raise HTTPException(status_code=404, detail="No hay ordenes de pago registradas.")
    ordenes = [OrdenPagoRead.model_validate(orden) for orden in db_ordenes]

    for orden in ordenes:
        if not orden.id_club: 
            pass
        db_club = db.query(Club).filter(Club.id_club == orden.id_club).first()
        orden.nombre_club = db_club.nombre_club
    return ordenes

@handle_db_exceptions
def create_orden_pago(db: Session, orden_pago: OrdenPagoCreate, current_user: dict) -> OrdenPago:
    try:
        rut_usuario = current_user["rut_usuario"]
        db_orden_pago = OrdenPago(**orden_pago.model_dump(mode="json"))
        db_orden_pago.usuario_emisor = rut_usuario

        if orden_pago.id_club:
            db_club = db.query(Club).filter(Club.id_club == orden_pago.id_club)

        db.add(db_orden_pago)
        db.commit()
        db.refresh(db_orden_pago)
        return db_orden_pago
    except IntegrityError as e:
        print(e) # WARNING: SE DEBE ELIMINAR EL PRINT CUANDO ESTE PROBADO EL METODO
        db.rollback()
        raise HTTPException(status_code=400, detail="Error de integridad en la base de datos.") from e

@handle_db_exceptions
def delete_orden_pago(db: Session, id_orden: int, current_user: Usuario = Depends(get_current_user)) -> dict:
    db_orden_pago = get_orden_pago(db, id_orden)
    db.delete(db_orden_pago)
    db.commit()
    return {"details": "Orden de pago eliminada exitosamente."}
