from sqlalchemy.orm import Session
from app.models import Jugador
from app.schemas import JugadorCreate, JugadorUpdate
from fastapi import HTTPException

# TODO: Aplicar auth security para poder implementar auditoria
def get_jugador(db: Session, rut_jugador: str) -> Jugador | None:
    return db.query(Jugador).filter(Jugador.rut_jugador == rut_jugador).first()


def get_jugadores(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Jugador).offset(skip).limit(limit).all()


def create_jugador(db: Session, jugador: JugadorCreate) -> Jugador:
    # Verificar si el jugador ya existe
    db_jugador = get_jugador(db, jugador.rut_jugador)
    if db_jugador:
        # Lanzar error HTTP 409 (conflicto)
        raise HTTPException(
            status_code=409,
            detail="El RUT ingresado ya se encuentra registrado"
        )
    
    # Crear jugador
    nuevo_jugador = Jugador(**jugador.dict())
    db.add(nuevo_jugador)
    db.commit()
    db.refresh(nuevo_jugador)
    return nuevo_jugador


def update_jugador(
    db: Session, rut_jugador: str, jugador_update: JugadorUpdate
) -> Jugador | None:
    db_jugador = get_jugador(db, rut_jugador)
    if not db_jugador:
        return None

    update_data = jugador_update.dict(exclude_unset=True)

    # ✅ Si enfermedades_cronicas viene explícitamente como None o "", reemplazar por texto
    if "enfermedades_cronicas" in update_data:
        if update_data["enfermedades_cronicas"] is None or str(update_data["enfermedades_cronicas"]).strip() == "":
            update_data["enfermedades_cronicas"] = "Sin enfermedades crónicas"

    # ✅ Asignar los nuevos valores al modelo
    for key, value in update_data.items():
        setattr(db_jugador, key, value)

    db.commit()
    db.refresh(db_jugador)
    return db_jugador


def delete_jugador(db: Session, rut_jugador: str) -> bool:
    db_jugador = get_jugador(db, rut_jugador)
    if not db_jugador:
        return False
    db.delete(db_jugador)
    db.commit()
    return True