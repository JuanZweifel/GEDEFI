from sqlalchemy.orm import Session
from app.models import ContratoClub
from app.schemas import ContratoClubCreate, ContratoClubUpdate
from sqlalchemy import and_


def get_contrato_club(db: Session, asociacion_id: int, club_id) -> ContratoClub | None:
    return (
        db.query(ContratoClub)
        .filter(
            and_(
                ContratoClub.id_asociacion == asociacion_id,
                ContratoClub.id_club == club_id,
            )
        )
        .first()
    )


def get_contratos_club(
    db: Session, skip: int = 0, limit: int = 100
) -> list[ContratoClub]:
    return db.query(ContratoClub).offset(skip).limit(limit).all()


def create_contrato_club(
    db: Session, contrato_club: ContratoClubCreate
) -> ContratoClub:
    db_contrato_club = ContratoClub(**contrato_club.dict())
    db.add(db_contrato_club)
    db.commit()
    db.refresh(db_contrato_club)
    return db_contrato_club


def update_contrato_club(
    db: Session,
    asociacion_id: int,
    club_id: int,
    contrato_club_update: ContratoClubUpdate,
) -> ContratoClub | None:
    db_contrato_club = get_contrato_club(db, asociacion_id, club_id)
    if not db_contrato_club:
        return None
    for key, value in contrato_club_update.dict(exclude_unset=True).items():
        setattr(db_contrato_club, key, value)
    db.commit()
    db.refresh(db_contrato_club)
    return db_contrato_club


def delete_contrato_club(db: Session, asociacion_id: int, club_id: int) -> bool:
    db_contrato_club = get_contrato_club(db, asociacion_id, club_id)
    if not db_contrato_club:
        return False
    db.delete(db_contrato_club)
    db.commit()
    return True
