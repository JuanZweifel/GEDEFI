from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.db import get_db
from app import services, schemas
from app.models import Reunion, Usuario, DetalleReunion
from datetime import datetime, timedelta

router = APIRouter(prefix="/reuniones", tags=["Reuniones"])


@router.post("/", response_model=schemas.ReunionRead)
def create_reunion(reunion: schemas.ReunionCreate, db: Session = Depends(get_db)):
    try:
        return services.create_reunion(db, reunion)
    except HTTPException as e:
        raise e


@router.get("/{reunion_id}", response_model=schemas.ReunionRead)
def read_reunion(reunion_id: int, db: Session = Depends(get_db)):
    try:
        return services.get_reunion(db, reunion_id)
    except HTTPException as e:
        raise e


@router.get("/", response_model=list[schemas.ReunionRead])
def read_reuniones(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        return services.get_reuniones(db, skip=skip, limit=limit)
    except HTTPException as e:
        raise e


@router.put("/{reunion_id}", response_model=schemas.ReunionRead)
def update_reunion(
    reunion_id: int, reunion: schemas.ReunionUpdate, db: Session = Depends(get_db)
):
    try:
        return services.update_reunion(db, reunion_id, reunion)
    except HTTPException as e:
        raise e


@router.delete("/{reunion_id}", status_code=204)
def delete_reunion(reunion_id: int, db: Session = Depends(get_db)):
    try:
        return services.delete_reunion(db, reunion_id)
    except HTTPException as e:
        raise e


@router.get("/{rut}/reuniones")
def reuniones_usuario(rut: str, db: Session = Depends(get_db)):
    reuniones = db.query(Reunion).all()
    detalle_map = {
        (d.id_reunion): d
        for d in db.query(DetalleReunion).filter_by(rut_usuario=rut).all()
    }

    print(rut)
    print(db.query(DetalleReunion).filter_by(rut_usuario=rut).count())
    result = []
    for r in reuniones:
        detalle = detalle_map.get(r.id_reunion)
        asistencia = None
        if detalle:
            asistencia = {
                "attended": detalle.hora_llegada is not None,
                "hora_llegada": detalle.hora_llegada,
                "hora_salida": detalle.hora_salida,
            }

        result.append(
            {
                "id_reunion": r.id_reunion,
                "titulo_reunion": r.titulo_reunion,
                "fecha_reunion": r.fecha_reunion,
                "hora_reunion": r.hora_reunion,
                "lugar_reunion": r.lugar_reunion,
                "asistencia": asistencia,
            }
        )

    return result


@router.get("/{id_reunion}/asistencia")
def get_asistencia_reunion(id_reunion: int, db: Session = Depends(get_db)):
    detalles = (
        db.query(DetalleReunion)
        .options(joinedload(DetalleReunion.usuario))
        .filter(DetalleReunion.id_reunion == id_reunion)
        .all()
    )

    return [
        {
            "rut_usuario": d.rut_usuario,
            "nombre": d.usuario.nombre_usuario if d.usuario else None,
            "hora_llegada": d.hora_llegada,
            "hora_salida": d.hora_salida,
        }
        for d in detalles
    ]


@router.post("/asistencia")
def create_asistencia(req: schemas.AsistenciaRequest, db: Session = Depends(get_db)):
    reunion = db.query(Reunion).filter(Reunion.id_reunion == req.id_reunion).first()
    if not reunion:
        raise HTTPException(status_code=404, detail="Reunión no encontrada")

    # Compute meeting window
    start_dt = datetime.combine(reunion.fecha_reunion, reunion.hora_reunion)

    if hasattr(reunion, "hora_fin_reunion") and reunion.hora_fin_reunion:
        end_dt = datetime.combine(reunion.fecha_reunion, reunion.hora_fin_reunion)
    else:
        end_dt = start_dt + timedelta(minutes=90)

    now = datetime.now()

    # Validate attendance window
    if not (start_dt <= now <= end_dt):
        raise HTTPException(
            status_code=403,
            detail="La reunión no está actualmente en curso. No se puede registrar asistencia.",
        )

    user = db.query(Usuario).filter(Usuario.rut_usuario == req.rut_usuario).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    detalle = (
        db.query(DetalleReunion)
        .filter(
            DetalleReunion.id_reunion == req.id_reunion,
            DetalleReunion.rut_usuario == req.rut_usuario,
        )
        .first()
    )

    if detalle:
        if req.hora_llegada:
            detalle.hora_llegada = req.hora_llegada
        if req.hora_salida:
            detalle.hora_salida = req.hora_salida
    else:
        detalle = DetalleReunion(
            rut_usuario=req.rut_usuario,
            id_reunion=req.id_reunion,
            hora_llegada=req.hora_llegada,
            hora_salida=req.hora_salida,
        )
        db.add(detalle)

    db.commit()
    return {"status": "ok", "message": "Asistencia registrada correctamente"}
