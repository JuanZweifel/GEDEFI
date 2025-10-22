from sqlalchemy.orm import Session
from app.models import rendimiento_entrenamiento
from app.schemas import RendimientoEntrenamientoCreate, RendimientoEntrenamientoUpdate

# 🔹 Obtener un rendimiento por su ID
def get_rendimiento_entrenamiento(
    db: Session, id_rendimiento: int
) -> rendimiento_entrenamiento.RendimientoEntrenamiento | None:
    return (
        db.query(rendimiento_entrenamiento.RendimientoEntrenamiento)
        .filter(rendimiento_entrenamiento.RendimientoEntrenamiento.id_rendimiento == id_rendimiento)
        .first()
    )


# 🔹 Listar todos los rendimientos (con paginación)
def get_rendimientos_entrenamiento(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(rendimiento_entrenamiento.RendimientoEntrenamiento)
        .offset(skip)
        .limit(limit)
        .all()
    )


# 🔹 Crear un nuevo registro de rendimiento
def create_rendimiento_entrenamiento(
    db: Session, rendimiento_data: RendimientoEntrenamientoCreate
) -> rendimiento_entrenamiento.RendimientoEntrenamiento:
    db_rendimiento = rendimiento_entrenamiento.RendimientoEntrenamiento(**rendimiento_data.dict())
    db.add(db_rendimiento)
    db.commit()
    db.refresh(db_rendimiento)
    return db_rendimiento


# 🔹 Actualizar un rendimiento existente
def update_rendimiento_entrenamiento(
    db: Session, id_rendimiento: int, rendimiento_update: RendimientoEntrenamientoUpdate
) -> rendimiento_entrenamiento.RendimientoEntrenamiento | None:
    db_rendimiento = get_rendimiento_entrenamiento(db, id_rendimiento)
    if not db_rendimiento:
        return None
    for key, value in rendimiento_update.dict(exclude_unset=True).items():
        setattr(db_rendimiento, key, value)
    db.commit()
    db.refresh(db_rendimiento)
    return db_rendimiento


# 🔹 Eliminar un rendimiento
def delete_rendimiento_entrenamiento(db: Session, id_rendimiento: int) -> bool:
    db_rendimiento = get_rendimiento_entrenamiento(db, id_rendimiento)
    if not db_rendimiento:
        return False
    db.delete(db_rendimiento)
    db.commit()
    return True