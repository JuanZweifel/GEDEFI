from sqlalchemy.orm import Session
from app.models import entrenamiento
from app.schemas import EntrenamientoCreate, EntrenamientoUpdate


def get_entrenamiento(
    db: Session, id_entrenamiento: int
) -> entrenamiento.Entrenamiento | None:
    return (
        db.query(entrenamiento.Entrenamiento)
        .filter(entrenamiento.Entrenamiento.id_entrenamiento == id_entrenamiento)
        .first()
    )


def get_entrenamientos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(entrenamiento.Entrenamiento).offset(skip).limit(limit).all()


from sqlalchemy.orm import Session
from app.models import entrenamiento, ficha_jugador, rendimiento_entrenamiento
from app.schemas import EntrenamientoCreate

def create_entrenamiento(
    db: Session, entrenamiento_data: EntrenamientoCreate
) -> entrenamiento.Entrenamiento:
        
        # 1️⃣ Crear el entrenamiento
        db_entrenamiento = entrenamiento.Entrenamiento(**entrenamiento_data.dict())
        db.add(db_entrenamiento)
        db.commit()
        db.refresh(db_entrenamiento)
        return db_entrenamiento


def update_entrenamiento(
    db: Session, id_entrenamiento: int, entrenamiento_update: EntrenamientoUpdate
) -> entrenamiento.Entrenamiento | None:
    db_entrenamiento = get_entrenamiento(db, id_entrenamiento)
    if not db_entrenamiento:
        return None

    # ⚙️ Detectar si el campo 'activo' cambia a False
    activo_anterior = db_entrenamiento.activo
    nuevo_activo = entrenamiento_update.dict(exclude_unset=True).get("activo", activo_anterior)

    # 🔹 Actualizar campos del entrenamiento
    for key, value in entrenamiento_update.dict(exclude_unset=True).items():
        setattr(db_entrenamiento, key, value)

    db.commit()
    db.refresh(db_entrenamiento)

    # ✅ Si el entrenamiento pasó de activo a inactivo → crear rendimientos
    if activo_anterior and not nuevo_activo:
        try:
            # Obtener todos los jugadores de la serie
            jugadores = (
                db.query(ficha_jugador.FichaJugador.rut_jugador)
                .filter(ficha_jugador.FichaJugador.id_serie == db_entrenamiento.id_serie)
                .all()
            )

            if jugadores:
                nuevos_rendimientos = [
                    rendimiento_entrenamiento.RendimientoEntrenamiento(
                        id_entrenamiento=db_entrenamiento.id_entrenamiento,
                        rut_jugador=j[0],
                        # Los demás campos pueden quedar nulos o con default
                    )
                    for j in jugadores
                ]
                db.add_all(nuevos_rendimientos)
                db.commit()
                print(f"✅ Se crearon {len(nuevos_rendimientos)} rendimientos para el entrenamiento {id_entrenamiento}")
            else:
                print(f"⚠️ No hay jugadores asociados a la serie {db_entrenamiento.id_serie}")

        except Exception as e:
            db.rollback()
            print(f"❌ Error al crear rendimientos: {e}")

    return db_entrenamiento


def delete_entrenamiento(db: Session, id_entrenamiento: int) -> bool:
    try:
        db_entrenamiento = get_entrenamiento(db, id_entrenamiento)
        if not db_entrenamiento:
            return False  # No existe

        if not db_entrenamiento.activo:
            raise ValueError("No se puede eliminar un entrenamiento inactivo")

        db.delete(db_entrenamiento)
        db.commit()
        return True

    except Exception as e:
        print(f"❌ ERROR en delete_entrenamiento: {e}")
        raise
