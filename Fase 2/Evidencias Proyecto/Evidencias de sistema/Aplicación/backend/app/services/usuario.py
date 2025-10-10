from sqlalchemy import exists, select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models import Usuario, DetalleUsuarioClub
from app.schemas import UsuarioCreate, UsuarioUpdate
from app.security import get_password_hash
from app.utils.decorators import handle_db_exceptions
from fastapi import HTTPException
from app.services.emails import send_user_deactivated_email


@handle_db_exceptions
def get_usuario(db: Session, rut_usu: str) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.rut_usuario == rut_usu).first()


@handle_db_exceptions
def get_usuarios(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Usuario).offset(skip).limit(limit).all()


@handle_db_exceptions
def create_usuario(db: Session, usuario: UsuarioCreate) -> Usuario:
    hashed_password = get_password_hash(usuario.pass_usuario)

    db_usuario = Usuario(
        **usuario.dict(exclude={"pass_usuario", "admin", "id_club"}),
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
        constraint = getattr(e.orig.diag, "constraint_name", "")
        if constraint == "USUARIO_rut_usuario_key":
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

    for key, value in update_data.items():
        setattr(db_usuario, key, value)

    try:
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
    db.delete(db_usuario)
    db.commit()
    return True


@handle_db_exceptions
def is_user_active(db: Session, rut_usu: str) -> bool:
    return db.query(
        exists().where(Usuario.rut_usuario == rut_usu, Usuario.usuario_activo.is_(True))
    ).scalar()


# def check_usuario(db: Session, rut_usu: str) -> bool:
