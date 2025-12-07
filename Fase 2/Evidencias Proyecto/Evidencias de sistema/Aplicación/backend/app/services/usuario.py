from sqlalchemy import exists, select
from sqlalchemy import or_
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from psycopg2.errors import ForeignKeyViolation
from app.models import (
    Usuario,
    DetalleUsuarioClub,
    Club,
    Archivo,
    OrdenPago,
    Solicitud,
    DetalleReunion,
    Entrenamiento,
    Auditoria,
)
from app.schemas import UsuarioCreate, UsuarioUpdate
from app.security import get_password_hash, verify_password
from app.utils.decorators import handle_db_exceptions, handle_audit
from fastapi import HTTPException
from app.services.correo import send_user_deactivated_email
from datetime import datetime
from app.utils.auditoria import set_rut
from typing import Optional


# TODO: Aplicar auth security para poder implementar auditoria
@handle_db_exceptions
def get_usuario(db: Session, rut_usu: str) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.rut_usuario == rut_usu).first()


@handle_db_exceptions
def get_usuarios(
    db: Session,
    current_user: dict,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    estado: Optional[int] = None,
    club: Optional[int] = None,
) -> dict:
    """
    Retorna los usuarios con su club asignado.
    Soporta paginación (skip, limit), búsqueda y filtrado por estado.
    Excluye al usuario actual SOLO si no se filtra por club.
    Respuesta: { items: list[Usuario], total: int }
    """
    try:
        # --- Query base ---
        base_query = (
            db.query(Usuario, Club.id_club)
            .outerjoin(
                DetalleUsuarioClub,
                (Usuario.rut_usuario == DetalleUsuarioClub.rut_usuario)
                & (DetalleUsuarioClub.fecha_fin == None),
            )
            .outerjoin(Club, DetalleUsuarioClub.id_club == Club.id_club)
        )

        # Solo excluir al usuario actual si NO se está filtrando por club
        if club is None:
            base_query = base_query.filter(
                Usuario.rut_usuario != current_user.get("rut_usuario")
            )

        # --- Filtro por estado ---
        if estado == 1:
            base_query = base_query.filter(Usuario.usuario_activo == True)
        elif estado == 2:
            base_query = base_query.filter(Usuario.usuario_activo == False)

        # --- Filtro por club ---
        if club is not None:
            print("Filtro por club aplicado:")
            print(club)
            base_query = base_query.filter(Club.id_club == club)

        # --- Filtro por búsqueda ---
        if search:
            like_pattern = f"%{search}%"
            base_query = base_query.filter(
                or_(
                    Usuario.nombre_usuario.ilike(like_pattern),
                    Usuario.apellido_usuario.ilike(like_pattern),
                    Usuario.email_usuario.ilike(like_pattern),
                    Usuario.rut_usuario.ilike(like_pattern),
                )
            )

        # --- Total antes de paginar ---
        total = base_query.count()

        # --- Aplicar paginación ---
        usuarios_clubes = (
            base_query.order_by(Usuario.fecha_creacion.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

        # --- Construcción de respuesta ---
        usuarios = []
        for usuario, id_club in usuarios_clubes:
            usuarios.append(
                {
                    "rut_usuario": usuario.rut_usuario,
                    "nombre_usuario": usuario.nombre_usuario,
                    "apellido_usuario": usuario.apellido_usuario,
                    "email_usuario": usuario.email_usuario,
                    "fecha_nacimiento": usuario.fecha_nacimiento,
                    "usuario_activo": usuario.usuario_activo,
                    "huella_indice": usuario.huella_indice,
                    "huella_pulgar": usuario.huella_pulgar,
                    "fecha_creacion": usuario.fecha_creacion,
                    "fecha_modificacion": usuario.fecha_modificacion,
                    "id_rol": usuario.id_rol,
                    "id_club": id_club or None,
                }
            )

        return {"items": usuarios, "total": total}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener los usuarios con su club: {str(e)}",
        )


@handle_db_exceptions
def create_usuario(db: Session, usuario: UsuarioCreate, current_user: dict) -> Usuario:
    set_rut(db, current_user.get("rut_usuario"))
    hashed_password = get_password_hash(usuario.pass_usuario)

    db_usuario = Usuario(
        **usuario.dict(exclude={"pass_usuario", "id_club"}),
        pass_usuario=hashed_password,
    )

    if not usuario.asociacion:
        if usuario.id_club == 0:
            raise HTTPException(
                status_code=400,
                detail="Debe asociar un club a un usuario NO administrativo.",
            )
        db_detalle = DetalleUsuarioClub(
            rut_usuario=usuario.rut_usuario, id_club=usuario.id_club
        )
        db_usuario.detalles_usuario_club.append(db_detalle)

    try:
        db.add(db_usuario)
        db.commit()
        db.refresh(db_usuario)
        return db_usuario

    except IntegrityError as e:
        db.rollback()

        orig = getattr(e, "orig", None)
        constraint = getattr(getattr(orig, "diag", None), "constraint_name", "")
        if isinstance(orig, ForeignKeyViolation):
            detail = "El rol o club asociado no existe en el sistema."
        elif constraint == "USUARIO_rut_usuario_key":
            detail = f"El RUT {usuario.rut_usuario} ya está registrado."
        elif constraint == "USUARIO_email_usuario_key":
            detail = f"El email {usuario.email_usuario} ya está registrado."
        else:
            detail = "Error de integridad en la base de datos."
        raise HTTPException(status_code=409, detail=detail) from e


@handle_db_exceptions
def update_usuario(
    db: Session, rut_usu: str, usuario_update: UsuarioUpdate, current_user: dict
) -> Usuario | None:
    db_usuario = get_usuario(db, rut_usu)
    if not db_usuario:
        return None

    update_data = usuario_update.dict(exclude_unset=True)
    previously_active = db_usuario.usuario_activo

    if "pass_usuario" in update_data and update_data["pass_usuario"]:
        update_data["pass_usuario"] = get_password_hash(update_data["pass_usuario"])

    new_club_ids = update_data.pop("id_club", None)
    if new_club_ids is not None and not isinstance(new_club_ids, list):
        new_club_ids = [new_club_ids]

    for key, value in update_data.items():
        setattr(db_usuario, key, value)

    try:
        end_date = datetime.today()

        active_relations = (
            db.query(DetalleUsuarioClub)
            .filter_by(rut_usuario=rut_usu, fecha_fin=None)
            .all()
        )

        if new_club_ids is None:
            for relation in active_relations:
                relation.fecha_fin = end_date

        else:
            if not isinstance(new_club_ids, list):
                new_club_ids = [new_club_ids]

            current_club_ids = {r.id_club for r in active_relations}

            for relation in active_relations:
                if relation.id_club not in new_club_ids:
                    relation.fecha_fin = end_date

            for club_id in new_club_ids:
                if club_id not in current_club_ids:
                    new_relation = DetalleUsuarioClub(
                        rut_usuario=rut_usu, id_club=club_id
                    )
                    db_usuario.detalles_usuario_club.append(new_relation)

        db.commit()
        db.refresh(db_usuario)

        if previously_active and not db_usuario.usuario_activo:
            send_user_deactivated_email(
                db_usuario.email_usuario, db_usuario.nombre_usuario
            )

        return db_usuario

    except IntegrityError as e:
        db.rollback()
        constraint = getattr(e.orig.diag, "constraint_name", "")
        if constraint == "USUARIO_email_usuario_key":
            detail = f"El email {update_data.get('email_usuario')} ya está registrado."
        else:
            detail = "Error de integridad en la base de datos."
        raise HTTPException(status_code=409, detail=detail) from e


@handle_db_exceptions
def delete_usuario(db: Session, rut_usu: str, current_user: dict) -> bool:
    db_usuario = get_usuario(db, rut_usu, current_user=current_user)
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    try:
        relaciones_club = (
            db.query(DetalleUsuarioClub)
            .filter(DetalleUsuarioClub.rut_usuario == rut_usu)
            .all()
        )
        print("Entra a verificar relaciones")

        # Verificar relaciones con tablas que requieren trazabilidad
        tiene_relaciones = any(
            [
                db.query(Archivo).filter(Archivo.id_usuario == rut_usu).first(),
                db.query(Solicitud)
                .filter(Solicitud.usuario_solicitud == rut_usu)
                .first(),
                db.query(Solicitud)
                .filter(Solicitud.usuario_respuesta == rut_usu)
                .first(),
                db.query(OrdenPago).filter(OrdenPago.usuario_emisor == rut_usu).first(),
                db.query(OrdenPago).filter(OrdenPago.usuario_pago == rut_usu).first(),
                db.query(DetalleReunion)
                .filter(DetalleReunion.rut_usuario == rut_usu)
                .first(),
                db.query(Entrenamiento)
                .filter(Entrenamiento.rut_usuario == rut_usu)
                .first(),
                db.query(Auditoria).filter(Auditoria.rut_usuario == rut_usu).first(),
            ]
        )

        if tiene_relaciones:
            db_usuario.usuario_activo = False
            db.commit()
            raise HTTPException(
                status_code=400,
                detail=(
                    "El usuario no puede ser eliminado porque tiene registros "
                    "asociados a archivos, órdenes de pago, solicitudes, "
                    "reuniones, entrenamientos o auditorías. "
                    "El usuario fue deshabilitado para mantener la trazabilidad."
                ),
            )

        if len(relaciones_club) > 1:
            db_usuario.usuario_activo = False
            db.commit()
            raise HTTPException(
                status_code=400,
                detail=(
                    "El usuario tiene múltiples relaciones activas con clubes. "
                    "Solo fue deshabilitado."
                ),
            )

        if len(relaciones_club) == 1:
            db.delete(relaciones_club[0])
            db.delete(db_usuario)
            db.commit()
            return True

        if not relaciones_club:
            db.delete(db_usuario)
            db.commit()
            return True

    except IntegrityError as e:
        db.rollback()
        constraint = getattr(e.orig.diag, "constraint_name", "")
        detail = (
            f"No se puede eliminar el usuario debido a la restricción {constraint}."
            if constraint
            else "Error de integridad en la base de datos al intentar eliminar el usuario."
        )
        raise HTTPException(status_code=409, detail=detail) from e


@handle_db_exceptions
def is_user_active(db: Session, rut_usu: str) -> bool:
    return db.query(
        exists().where(Usuario.rut_usuario == rut_usu, Usuario.usuario_activo.is_(True))
    ).scalar()


@handle_db_exceptions
def update_password(
    db: Session, rut_usu: str, current_pass: str, new_pass: str, current_user: dict
):
    usuario = db.query(Usuario).filter(Usuario.rut_usuario == rut_usu).first()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if not verify_password(current_pass, usuario.pass_usuario):
        raise HTTPException(
            status_code=400, detail="La contraseña actual es incorrecta"
        )

    hashed = get_password_hash(new_pass)
    usuario.pass_usuario = hashed
    usuario.fecha_modificacion = datetime.now()

    db.commit()
    db.refresh(usuario)

    return {"message": "Contraseña actualizada correctamente"}
