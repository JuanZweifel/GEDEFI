from sqlalchemy import exists, select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from psycopg2.errors import ForeignKeyViolation
from app.models import Usuario, DetalleUsuarioClub, Club
from app.schemas import UsuarioCreate, UsuarioUpdate
from app.security import get_password_hash
from app.utils.decorators import handle_db_exceptions
from fastapi import HTTPException
from app.services.emails import send_user_deactivated_email
from datetime import datetime


@handle_db_exceptions
def get_usuario(db: Session, rut_usu: str) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.rut_usuario == rut_usu).first()


@handle_db_exceptions
def get_usuarios(db: Session, skip: int = 0, limit: int = 100):
    try:
        usuarios_clubes = (
            db.query(Usuario, Club.id_club)
            .outerjoin(
                DetalleUsuarioClub,
                (Usuario.rut_usuario == DetalleUsuarioClub.rut_usuario)
                & (DetalleUsuarioClub.fecha_fin == None),
            )
            .outerjoin(Club, DetalleUsuarioClub.id_club == Club.id_club)
            .offset(skip)
            .limit(limit)
            .all()
        )

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
                    "fecha_creacion": usuario.fecha_creacion,
                    "fecha_modificacion": usuario.fecha_modificacion,
                    "id_rol": usuario.id_rol,
                    "id_club": id_club or None,
                }
            )

        return usuarios

    except Exception as e:
        raise HTTPException(
            status_code=500, detail="Error al obtener los usuarios con su club."
        )


@handle_db_exceptions
def create_usuario(db: Session, usuario: UsuarioCreate) -> Usuario:
    hashed_password = get_password_hash(usuario.pass_usuario)

    db_usuario = Usuario(
        **usuario.dict(exclude={"pass_usuario", "id_club"}),
        pass_usuario=hashed_password,
    )

    if not usuario.admin:
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
    db: Session, rut_usu: str, usuario_update: UsuarioUpdate
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
def delete_usuario(db: Session, rut_usu: str) -> bool:
    db_usuario = get_usuario(db, rut_usu)
    if not db_usuario:
        return False

    try:
        # db.query(DetalleUsuarioClub).filter_by(rut_usuario=rut_usu).delete()

        db.delete(db_usuario)
        db.commit()
        return True

    except AssertionError as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=(
                "No se puede eliminar el usuario porque tiene relaciones activas "
                "con clubes. Primero elimine o desvincule estas relaciones."
            ),
        ) from e

    except IntegrityError as e:
        db.rollback()
        constraint = getattr(e.orig.diag, "constraint_name", "")
        if constraint:
            detail = (
                f"No se puede eliminar el usuario debido a la restricción {constraint}."
            )
        else:
            detail = "Error de integridad en la base de datos al intentar eliminar el usuario."
        raise HTTPException(status_code=409, detail=detail) from e


@handle_db_exceptions
def is_user_active(db: Session, rut_usu: str) -> bool:
    return db.query(
        exists().where(Usuario.rut_usuario == rut_usu, Usuario.usuario_activo.is_(True))
    ).scalar()


# def check_usuario(db: Session, rut_usu: str) -> bool:
