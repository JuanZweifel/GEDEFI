from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models import Fas, UsoFas  
from app.schemas import FasCreate, FasUpdate
from datetime import datetime
# TODO: Aplicar auth security para poder implementar auditoria

def get_fas_publico(db: Session):
    """Obtiene el FAS correspondiente al año actual."""
    anio_actual = datetime.now().year
    return (
        db.query(Fas)
        .filter(Fas.anio_fas == anio_actual)
        .first()
    )


def get_fas(db: Session, fas_id: int) -> Fas | None:
    """Obtiene un registro FAS por ID."""
    return db.query(Fas).filter(Fas.id_fas == fas_id).first()


def get_fondos_fas(db: Session, skip: int = 0, limit: int = 100):
    """Obtiene todos los fondos FAS con paginación."""
    return db.query(Fas).offset(skip).limit(limit).all()



def create_fas(db: Session, fas_data: FasCreate) -> Fas:
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




def update_fas(db: Session, fas_id: int, fas_update: FasUpdate) -> Fas | None:
    """Actualiza un fondo FAS existente, solo si no tiene usos registrados."""
    db_fas = db.query(Fas).filter(Fas.id_fas == fas_id).first()
    if not db_fas:
        raise HTTPException(status_code=404, detail="Fondo FAS no encontrado")

    # 🔹 Verificar si este fondo ya tiene algún uso asociado
    usos_existentes = db.query(UsoFas).filter(UsoFas.id_fas == fas_id).count()
    if usos_existentes > 0:
        raise HTTPException(
            status_code=400,
            detail="No se puede modificar un FAS que ya tiene usos registrados."
        )

    # 🔹 Actualizar solo los campos enviados
    for key, value in fas_update.dict(exclude_unset=True).items():
        setattr(db_fas, key, value)

    db.commit()
    db.refresh(db_fas)
    return db_fas


def delete_fas(db: Session, fas_id: int) -> bool:
    """Elimina un fondo FAS solo si no tiene usos asociados."""
    fas = db.query(Fas).filter(Fas.id_fas == fas_id).first()
    if not fas:
        raise HTTPException(status_code=404, detail="Fondo FAS no encontrado")

    # Verificar si tiene usos asociados
    usos_asociados = db.query(UsoFas).filter(UsoFas.id_fas == fas_id).count()
    if usos_asociados > 0:
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar un FAS que tiene usos registrados."
        )

    db.delete(fas)
    db.commit()
    return True


