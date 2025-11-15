from sqlalchemy.orm import Session
from app.models import Jugador, DetalleClubJugador, FichaJugador, UsoFas, RendimientoEntrenamiento, RendimientoPartido, Lesion
from app.schemas import JugadorCreate, JugadorUpdate
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from app.utils.decorators import handle_audit, handle_db_exceptions
from datetime import date, datetime

# TODO: Aplicar auth security para poder implementar auditoria
def get_jugador(db: Session, rut_jugador: str) -> Jugador | None:
    return db.query(Jugador).filter(Jugador.rut_jugador == rut_jugador).first()


def get_jugadores(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Jugador).offset(skip).limit(limit).all()


def create_jugador(db: Session, jugador: JugadorCreate) -> Jugador:
    # Verificar si el jugador ya existe
    db_jugador = get_jugador(db, jugador.rut_jugador)
    if db_jugador:
        raise HTTPException(
            status_code=409,
            detail="El RUT ingresado ya se encuentra registrado"
        )

    # ============================
    # Validación FECHA DE NACIMIENTO
    # ============================

    fecha_raw = jugador.fecha_nacimiento

    # Validar vacío
    if fecha_raw is None:
        raise HTTPException(
            status_code=400,
            detail="La fecha de nacimiento no puede estar vacía"
        )

    # Convertir string → fecha (si es string)
    if isinstance(fecha_raw, str):
        try:
            fecha_nac = datetime.strptime(fecha_raw, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Formato de fecha inválido. Use YYYY-MM-DD."
            )
    else:
        # Ya viene como date (Pydantic lo convierte)
        fecha_nac = fecha_raw

    # Fecha futura
    if fecha_nac > date.today():
        raise HTTPException(
            status_code=400,
            detail="La fecha de nacimiento no puede ser futura"
        )

    # Edad mínima
    edad = (date.today() - fecha_nac).days // 365
    if edad < 8:
        raise HTTPException(
            status_code=400,
            detail="El jugador debe tener al menos 8 años para registrarse"
        )

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






def ficha_tiene_datos(ficha: FichaJugador) -> bool:
    """
    Retorna True si la ficha del jugador tiene datos registrados.
    """
    campos = [
        ficha.talla_camiseta,
        ficha.talla_short,
        ficha.talla_media,
        ficha.talla_botin,
        ficha.estatura,
        ficha.Peso,   
        ficha.imc
    ]

    return any(c is not None for c in campos)

def rendimiento_entrenamiento_tiene_datos(r: RendimientoEntrenamiento) -> bool:
    """
    Retorna True si el rendimiento de entrenamiento contiene datos relevantes.
    """
    campos = [
        r.asistencia,
        r.calificacion_tecnica,
        r.calificacion_fisica,
        r.observaciones,
        r.goles if hasattr(r, "goles") else None,
        r.tarjetas if hasattr(r, "tarjetas") else None,
    ]

    return any(c is not None for c in campos)

def rendimiento_partido_tiene_datos(r: RendimientoPartido) -> bool:
    """
    Retorna True si el rendimiento de partido contiene datos relevantes.
    """
    campos = [
        r.minutos_jugados if hasattr(r, "minutos_jugados") else None,
        r.goles if hasattr(r, "goles") else None,
        r.asistencias if hasattr(r, "asistencias") else None,
        r.tarjetas if hasattr(r, "tarjetas") else None,
        r.observaciones if hasattr(r, "observaciones") else None,
    ]

    return any(c is not None for c in campos)

def uso_fas_tiene_datos(uso: UsoFas) -> bool:
    """
    Retorna True si el uso del FAS tiene datos válidos.
    En la práctica, si el registro existe ya tiene datos obligatorios.
    """
    campos = [
        uso.monto_usado,
        uso.fecha_uso,
        uso.descripcion_gasto  
    ]

    return any(c is not None for c in campos)

def lesion_tiene_datos(lesion: Lesion) -> bool:
    """
    Retorna True si la lesión tiene información registrada.
    Dado que varios campos son obligatorios, cualquier lesión existente
    siempre se considera como con datos.
    """
    campos = [
        lesion.nombre_lesion,
        lesion.tipo_lesion,
        lesion.descripcion,
        lesion.tiempo_recuperacion,
        lesion.fecha_lesion,
        lesion.fecha_fin_lesion,
    ]

    return any(c is not None for c in campos)


@handle_audit("DELETE", "JUGADOR")
def delete_jugador(db: Session, rut_jugador: str, current_user: dict) -> bool:
    """Elimina un jugador solo si NO tiene registros asociados con datos."""

    if not current_user:
        raise HTTPException(status_code=401, detail="No autorizado.")

    jugador = get_jugador(db, rut_jugador)
    if not jugador:
        raise HTTPException(status_code=404, detail="El jugador no existe.")

    # 1. Fichas
    fichas = db.query(FichaJugador).filter(
        FichaJugador.rut_jugador == rut_jugador
    ).all()
    ficha_con_datos = any(ficha_tiene_datos(f) for f in fichas)

    # 2. Usos FAS
    tiene_uso_fas = db.query(UsoFas).filter(
        UsoFas.rut_jugador == rut_jugador
    ).count() > 0

    # 3. Rendimiento entrenamiento
    rend_ent_list = db.query(RendimientoEntrenamiento).filter(
        RendimientoEntrenamiento.rut_jugador == rut_jugador
    ).all()
    rendimiento_ent_con_datos = any(
        rendimiento_entrenamiento_tiene_datos(r) for r in rend_ent_list
    )

    # 4. Rendimiento partido
    rend_part_list = db.query(RendimientoPartido).filter(
        RendimientoPartido.rut_jugador == rut_jugador
    ).all()
    rendimiento_part_con_datos = any(
        rendimiento_partido_tiene_datos(r) for r in rend_part_list
    )

    # 5. Lesiones
    lesiones = db.query(Lesion).filter(
        Lesion.rut_jugador == rut_jugador
    ).all()
    lesion_con_datos = any(lesion_tiene_datos(l) for l in lesiones)

    # ❌ Restricciones para no eliminar
    if (
        ficha_con_datos
        or tiene_uso_fas
        or rendimiento_ent_con_datos
        or rendimiento_part_con_datos
        or lesion_con_datos
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "No se puede eliminar el jugador porque tiene registros asociados "
                "(ficha con datos, lesiones, rendimiento deportivo o usos del FAS)."
            )
        )

    db.query(DetalleClubJugador).filter(
        DetalleClubJugador.rut_jugador == rut_jugador
    ).delete()

    # Eliminar fichas vacías
    for ficha in fichas:
        if not ficha_tiene_datos(ficha):
            db.delete(ficha)

    # Finalmente eliminar jugador
    try:
        db.delete(jugador)
        db.commit()
        return True

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")