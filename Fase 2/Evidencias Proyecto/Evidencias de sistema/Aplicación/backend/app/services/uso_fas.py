from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models import UsoFas, Fas, Jugador
from app.schemas import UsoFASCreate, UsoFASUpdate


def get_uso_fas(db: Session, uso_id: int) -> UsoFas | None:
    """Obtiene un registro de uso FAS por ID."""
    return db.query(UsoFas).filter(UsoFas.id_uso_fas == uso_id).first()


def get_usos_fas(db: Session, skip: int = 0, limit: int = 100):
    """Obtiene todos los usos FAS."""
    return db.query(UsoFas).offset(skip).limit(limit).all()


def create_uso_fas(db: Session, uso_data: UsoFASCreate) -> UsoFas:
    """Crea un nuevo registro de uso de fondo FAS."""
    # Verificar si el jugador existe
    jugador = db.query(Jugador).filter(Jugador.rut_jugador == uso_data.rut_jugador).first()
    if not jugador:
        raise HTTPException(status_code=404, detail="No se encontró un jugador con el RUT ingresado.")

    # Verificar si el FAS existe y está activo
    fas = db.query(Fas).filter(Fas.id_fas == uso_data.id_fas, Fas.activo == True).first()
    if not fas:
        raise HTTPException(status_code=404, detail="No se encontró un fondo FAS activo con el ID ingresado.")

    # Validar que haya suficiente dinero disponible
    if uso_data.monto_usado > fas.monto_disponible:
        raise HTTPException(
            status_code=400,
            detail=f"Fondos insuficientes. Disponible: {fas.monto_disponible}, solicitado: {uso_data.monto_usado}"
        )

    # Crear registro de uso
    db_uso = UsoFas(**uso_data.dict())
    db.add(db_uso)

    # Descontar del monto disponible del FAS
    fas.monto_disponible -= uso_data.monto_usado

    db.commit()
    db.refresh(db_uso)
    return db_uso


def update_uso_fas(db: Session, uso_id: int, uso_update: UsoFASUpdate) -> UsoFas | None:
    """Actualiza un registro de uso FAS."""
    db_uso = get_uso_fas(db, uso_id)
    if not db_uso:
        return None

    for key, value in uso_update.dict(exclude_unset=True).items():
        setattr(db_uso, key, value)

    db.commit()
    db.refresh(db_uso)
    return db_uso


def delete_uso_fas(db: Session, uso_id: int) -> bool:
    """Elimina un uso FAS y devuelve el monto al fondo."""
    db_uso = get_uso_fas(db, uso_id)
    if not db_uso:
        return False

    fas = db.query(Fas).filter(Fas.id_fas == db_uso.id_fas).first()
    if fas:
        fas.monto_disponible += db_uso.monto_usado  # Se devuelve el monto al fondo

    db.delete(db_uso)
    db.commit()
    return True