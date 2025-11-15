from sqlalchemy.orm import Session
from app.models.auditoria import Auditoria
from app.utils.decorators import handle_db_exceptions


from sqlalchemy import text

def set_rut(db, rut_usuario):
    db.execute(text("SELECT set_config('app.rut_usuario', :rut, true)"), {"rut": rut_usuario})

@handle_db_exceptions
def auditoria_errores(db: Session, recurso: str, id_recurso: str | None, descripcion, accion_realizada: str, rut_usuario: str):
    db_auditoria = Auditoria(
        recurso=recurso,
        id_recurso=id_recurso,
        datos_viejos=None,
        datos_nuevos=None,
        descripcion=descripcion,
        accion_realizada=accion_realizada,
        rut_usuario=rut_usuario,
        error=True
    )
    db.add(db_auditoria)
    db.commit()