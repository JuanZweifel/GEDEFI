from sqlalchemy.orm import Session
from app.models import Jugador, DetalleClubJugador, FichaJugador, UsoFas
from app.schemas import JugadorCreate, JugadorUpdate
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from app.utils.decorators import handle_audit, handle_db_exceptions
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



@handle_audit("DELETE", "JUGADOR")
def delete_jugador(db: Session, rut_jugador: str, current_user: dict) -> bool:
    """Elimina un jugador si no tiene registros asociados."""

    # ✅ Validación de token
    if not current_user:
        raise HTTPException(
            status_code=401,
            detail="No autorizado. Se requiere token válido."
        )

    # ✅ Buscar jugador
    db_jugador = get_jugador(db, rut_jugador)
    if not db_jugador:
        raise HTTPException(
            status_code=404,
            detail="El jugador no existe."
        )

    tiene_club = db.query(DetalleClubJugador).filter(
        DetalleClubJugador.rut_jugador == rut_jugador
    ).count()

    tiene_ficha = db.query(FichaJugador).filter(
        FichaJugador.rut_jugador == rut_jugador
    ).count()

    tiene_uso_fas = db.query(UsoFas).filter(
        UsoFas.rut_jugador == rut_jugador
    ).count()

    if tiene_club > 0 or tiene_ficha > 0 or tiene_uso_fas > 0:
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar el jugador porque tiene registros asociados (por ejemplo: club, ficha, asistencias o usos de FAS)."
        )

    # ✅ Eliminación
    try:
        db.delete(db_jugador)
        db.commit()
        return True

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar el jugador porque tiene registros asociados (por ejemplo: club, ficha, asistencias o usos de FAS)."
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error interno del servidor: {str(e)}"
        )