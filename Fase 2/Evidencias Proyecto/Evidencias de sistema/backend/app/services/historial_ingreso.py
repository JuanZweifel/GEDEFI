from sqlalchemy.orm import Session
from app.models import Historial_ingreso



def get_ingreso(db: Session, ingreso_id: int) -> Historial_ingreso | None:
    return db.query(Historial_ingreso).filter(Historial_ingreso.id_ingreso == ingreso_id).first()
