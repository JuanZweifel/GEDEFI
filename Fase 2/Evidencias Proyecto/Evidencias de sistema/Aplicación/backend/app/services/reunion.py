from sqlalchemy.orm import Session
from app.models import Reunion
from app.schemas import ReunionCreate, ReunionUpdate
from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError, IntegrityError, NoResultFound
from app.utils.decorators import handle_db_exceptions


# TODO: Aplicar auth security para poder implementar auditoria
@handle_db_exceptions
def get_reunion(db: Session, reunion_id: int) -> Reunion | None:
    try:
        return db.query(Reunion).filter(Reunion.id_reunion == reunion_id).first()
    except NoResultFound as e:
        raise HTTPException(status_code=404, detail="Reunión no encontrada") from e


@handle_db_exceptions
def get_reuniones(db: Session, skip: int = 0, limit: int = 100):
    try:
        return db.query(Reunion).offset(skip).limit(limit).all()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener las reuniones: {str(e)}",
        )


@handle_db_exceptions
def create_reunion(db: Session, reunion: ReunionCreate) -> Reunion:
    try:
        db_reunion = Reunion(**reunion.dict())
        db.add(db_reunion)
        db.commit()
        db.refresh(db_reunion)
        return db_reunion
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=400, detail="Error de integridad en la base de datos."
        ) from e


@handle_db_exceptions
def update_reunion(
    db: Session, reunion_id: int, reunion_update: ReunionUpdate
) -> Reunion | None:
    try:
        db_reunion = get_reunion(db, reunion_id)
        if not db_reunion:
            return None
        for key, value in reunion_update.dict(exclude_unset=True).items():
            setattr(db_reunion, key, value)
        db.commit()
        db.refresh(db_reunion)
        return db_reunion
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=400, detail="Error de integridad en la base de datos."
        ) from e


@handle_db_exceptions
def delete_reunion(db: Session, reunion_id: int) -> dict:
    try:
        db_reunion = get_reunion(db, reunion_id)
        db.delete(db_reunion)
        db.commit()
        return {"details": "Reunión eliminada exitosamente."}
    except (SQLAlchemyError, HTTPException) as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error interno del servidor") from e
