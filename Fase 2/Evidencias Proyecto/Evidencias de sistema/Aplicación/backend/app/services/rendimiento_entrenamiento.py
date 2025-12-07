from sqlalchemy.orm import Session
from app.models import rendimiento_entrenamiento
from app.schemas import RendimientoEntrenamientoCreate
from app import schemas, models

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
    db: Session,
    rut_jugador: str,
    id_entrenamiento: int,
    rendimiento_update: schemas.RendimientoEntrenamientoUpdate,
):
    # 🔍 Buscar rendimiento por clave compuesta
    db_rendimiento = (
        db.query(models.RendimientoEntrenamiento)
        .filter_by(rut_jugador=rut_jugador, id_entrenamiento=id_entrenamiento)
        .first()
    )

    if not db_rendimiento:
        return None

    # 📦 Convertir a dict solo los campos enviados
    data_update = rendimiento_update.dict(exclude_unset=True)

    # 🧠 Campos que activan asistencia = True si alguno viene con valor
    campos_disparadores = [
        "frecuencia_cardiaca",
        "velocidad",
        "duracion_recorrido",
        "nivel_oxigeno",
        "observaciones",
    ]

    if any(
        campo in data_update and data_update[campo] is not None
        for campo in campos_disparadores
    ):
        data_update["asistencia"] = True

    # 🔄 Aplicar los cambios
    for key, value in data_update.items():
        setattr(db_rendimiento, key, value)

    db.commit()
    db.refresh(db_rendimiento)

    print(
        f"✅ Rendimiento actualizado para {rut_jugador} - entrenamiento {id_entrenamiento}"
    )
    return db_rendimiento


# 🔹 Eliminar un rendimiento
def delete_rendimiento_entrenamiento(db: Session, id_rendimiento: int) -> bool:
    db_rendimiento = get_rendimiento_entrenamiento(db, id_rendimiento)
    if not db_rendimiento:
        return False
    db.delete(db_rendimiento)
    db.commit()
    return True