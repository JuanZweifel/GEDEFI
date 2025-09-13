from sqlalchemy.orm import Session
from app.models import Pais
from app.schemas import PaisCreate, PaisUpdate

def create_pais(db: Session, pais: PaisCreate):
    db_pais = Pais(**pais.dict())
    db.add(db_pais)
    db.commit()
    db.refresh(db_pais)
    return db_pais

def get_pais(db: Session, id_pais: int):
    return db.query(Pais).filter(Pais.id_pais == id_pais).first()

def get_paises(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Pais).offset(skip).limit(limit).all()

def update_pais(db: Session, id_pais: int, pais: PaisUpdate):
    db_pais = db.query(Pais).filter(Pais.id_pais == id_pais).first()
    if db_pais:
        for key, value in pais.dict(exclude_unset=True).items():
            setattr(db_pais, key, value)
        db.commit()
        db.refresh(db_pais)
    return db_pais

def delete_pais(db: Session, id_pais: int):
    db_pais = db.query(Pais).filter(Pais.id_pais == id_pais).first()
    if db_pais:
        db.delete(db_pais)
        db.commit()
    return db_pais

