from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from app.models import Auditoria
from app.schemas import AuditoriaRead
from app.utils.decorators import handle_db_exceptions
from fastapi import HTTPException, status
from datetime import datetime


def get_auditoria(db: Session, id_auditoria: int) -> Auditoria | None:
    return db.query(Auditoria).filter(Auditoria.id_auditoria == id_auditoria).first()


# TODO SE DEBE AÑADIR TOKEN A TODOS LOS SERVICIOS DE ACA
@handle_db_exceptions
def get_auditorias(
    db: Session,
    current_user: dict,
    skip: int | None = None,
    limit: int | None = None,
    accion_realizada: str | None = None,
    recurso: str | None = None,
    fecha_ini: datetime | None = None,
    fecha_fin: datetime | None = None,
) -> list[AuditoriaRead]:

    if not current_user.get("admin"): raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para ver los registros de auditoría")
    query = db.query(Auditoria).options(joinedload(Auditoria.usuario))

    # 🔍 Filtros dinámicos
    filters = []
    if accion_realizada:
        filters.append(Auditoria.accion_realizada == accion_realizada.upper())
    if recurso:
        filters.append(Auditoria.recurso.ilike(f"%{recurso}%"))
    if fecha_ini and fecha_fin:
        filters.append(Auditoria.fecha_cambio.between(fecha_ini, fecha_fin))
    elif fecha_ini:
        filters.append(Auditoria.fecha_cambio >= fecha_ini)
    elif fecha_fin:
        filters.append(Auditoria.fecha_cambio <= fecha_fin)

    if filters:
        query = query.filter(and_(*filters))

    # ⚙️ Solo aplicar skip/limit si no son None
    if skip is not None:
        query = query.offset(skip)
    if limit is not None:
        query = query.limit(limit)

    db_auditorias = query.all()

    auditorias = [
        AuditoriaRead(
            id_auditoria=a.id_auditoria,
            recurso=a.recurso,
            id_recurso=str(a.id_recurso) if a.id_recurso is not None else None,
            descripcion=a.descripcion,
            accion_realizada=a.accion_realizada,
            error=a.error,
            fecha_cambio=a.fecha_cambio,
            rut_usuario=a.usuario.rut_usuario if a.usuario else "",
            nombre_usuario=a.usuario.nombre_usuario if a.usuario else "",
            apellido_usuario=a.usuario.apellido_usuario if a.usuario else "",
        )
        for a in db_auditorias
    ]

    return auditorias

@handle_db_exceptions
def get_resumen_auditoria(db: Session, current_user: dict | None = None):
    #if not current_user.get("admin"): raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para ver el resumen de auditoría")
    
    hoy = datetime.now().date()
    acciones_hoy = db.query(Auditoria).filter(Auditoria.fecha_cambio >= hoy).count()
    exitos_hoy = db.query(Auditoria).filter(and_(Auditoria.fecha_cambio >= hoy, Auditoria.error == False)).count()
    errores_hoy = db.query(Auditoria).filter(and_(Auditoria.fecha_cambio >= hoy, Auditoria.error == True)).count()
    modulos_auditados = db.query(Auditoria.recurso).distinct().count()

    return {
        "acciones_hoy": acciones_hoy,
        "exitos_hoy": exitos_hoy,
        "errores_hoy": errores_hoy,
        "modulos_auditados": modulos_auditados
    }
