from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models import Fas  
from app.schemas import FASCreate, FASUpdate
from datetime import datetime
# TODO: Aplicar auth security para poder implementar auditoria
def get_fas(db: Session, fas_id: int) -> Fas | None:
    """Obtiene un registro FAS por ID."""
    return db.query(Fas).filter(Fas.id_fas == fas_id).first()


def get_fondos_fas(db: Session, skip: int = 0, limit: int = 100):
    """Obtiene todos los fondos FAS con paginación."""
    return db.query(Fas).offset(skip).limit(limit).all()



def create_fas(db: Session, fas_data: FASCreate) -> Fas:
    """Crea un nuevo fondo FAS, limitado a un registro por año (año actual)."""
    
    # Obtener el año actual del sistema
    anio_actual = datetime.now().year


    # Validar si ya existe un FAS para el año actual
    existing_fas = db.query(Fas).filter(Fas.anio_fas == anio_actual).first()
    if existing_fas:
        raise HTTPException(
            status_code=400,
            detail=f"Ya existe un FAS registrado para el año {anio_actual}."
        )

    # Asignar el monto disponible igual al monto inicial
    fas_dict = fas_data.dict()
    fas_dict["monto_disponible"] = fas_dict["monto_inicial"]
    fas_dict["anio_fas"] = anio_actual

    db_fas = Fas(**fas_dict)
    db.add(db_fas)
    db.commit()
    db.refresh(db_fas)

    return db_fas




def update_fas(db: Session, fas_id: int, fas_update: FASUpdate) -> Fas | None:
    """Actualiza un fondo FAS existente."""
    db_fas = get_fas(db, fas_id)
    if not db_fas:
        return None

    for key, value in fas_update.dict(exclude_unset=True).items():
        setattr(db_fas, key, value)

    db.commit()
    db.refresh(db_fas)
    return db_fas


def delete_fas(db: Session, fas_id: int) -> bool:
    """Elimina un fondo FAS por ID."""
    db_fas = get_fas(db, fas_id)
    if not db_fas:
        return False

    db.delete(db_fas)
    db.commit()
    return True