from sqlalchemy.orm import Session
from app.models import Club
from app.schemas import ClubCreate, ClubUpdate


def get_club(db: Session, id_club: int) -> Club | None:
    return db.query(Club).filter(Club.id_club == id_club).first()


def get_clubs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Club).offset(skip).limit(limit).all()


def create_club(db: Session, club: ClubCreate) -> Club:
    db_club = Club(**club.dict())
    db.add(db_club)
    db.commit()
    db.refresh(db_club)
    return db_club


def update_club(db: Session, id_club: int, club_update: ClubUpdate) -> Club | None:
    db_club = get_club(db, id_club)
    if not db_club:
        return None
    for key, value in club_update.dict(exclude_unset=True).items():
        setattr(db_club, key, value)
    db.commit()
    db.refresh(db_club)
    return db_club


def delete_club(db: Session, id_club: int) -> bool:
    db_club = get_club(db, id_club)
    if not db_club:
        return False
    db.delete(db_club)
    db.commit()
    return True
