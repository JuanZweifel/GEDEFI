from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas, models
from app.security import get_current_user


router = APIRouter(prefix="/fichas_jugador", tags=["Fichas Jugador"])

# Crear ficha jugador
@router.post("/", response_model=schemas.FichaJugadorRead)
def create_ficha_jugador(ficha: schemas.FichaJugadorCreate, db: Session = Depends(get_db)):
    return services.create_ficha_jugador(db, ficha)

# Obtener ficha por rut_jugador e id_serie
@router.get("/{rut_jugador}/{id_serie}", response_model=schemas.FichaJugadorRead)
def read_ficha_jugador(rut_jugador: str, id_serie: int, db: Session = Depends(get_db)):
    db_ficha = services.get_ficha_jugador(db, rut_jugador, id_serie)
    if not db_ficha:
        raise HTTPException(status_code=404, detail="Ficha jugador not found")
    return db_ficha

@router.get("/", response_model=list[schemas.FichaJugadorRead])
def read_fichas_jugador(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    print("\n📌 RUTA FICHAS")
    print("👤 USER:", current_user)

    # 🔹 CASO 1: ASOCIACIÓN → devuelve todas las fichas
    if current_user.get("asociacion", False):
        print("🟢 USUARIO ASOCIACIÓN → TODAS LAS FICHAS")
        return (
            db.query(models.FichaJugador)
            .offset(skip)
            .limit(limit)
            .all()
        )

    # 🔹 CASO 2: USUARIO DE CLUB → devuelve solo su club
    id_club = current_user.get("id_club")

    if not id_club:
        print("⚠️ USUARIO SIN CLUB → RETORNANDO VACÍO")
        return []

    print(f"🏟️ FILTRANDO POR CLUB DEL TOKEN → {id_club}")

    # Obtener ruts asociados al club
    ruts_club = (
        db.query(models.DetalleClubJugador.rut_jugador)
        .filter(models.DetalleClubJugador.id_club == id_club)
        .all()
    )

    print("🧾 RUTS EN EL CLUB:", ruts_club)

    ruts_club = [r[0] for r in ruts_club]

    if not ruts_club:
        print("⚠️ NO HAY JUGADORES EN ESTE CLUB")
        return []

    fichas = (
        db.query(models.FichaJugador)
        .filter(models.FichaJugador.rut_jugador.in_(ruts_club))
        .offset(skip)
        .limit(limit)
        .all()
    )

    print("📄 FICHAS OBTENIDAS:", fichas)

    return fichas

# Actualizar ficha jugador
@router.put("/{rut_jugador}/{id_serie}", response_model=schemas.FichaJugadorRead)
def update_ficha_jugador(rut_jugador: str, id_serie: int, ficha: schemas.FichaJugadorUpdate, db: Session = Depends(get_db)):
    db_ficha = services.update_ficha_jugador(db, rut_jugador, id_serie, ficha)
    if not db_ficha:
        raise HTTPException(status_code=404, detail="Ficha jugador not found")
    return db_ficha

# Eliminar ficha jugador
@router.delete("/{rut_jugador}/{id_serie}", status_code=204)
def delete_ficha_jugador(rut_jugador: str, id_serie: int, db: Session = Depends(get_db)):
    deleted = services.delete_ficha_jugador(db, rut_jugador, id_serie)
    if not deleted:
        raise HTTPException(status_code=404, detail="Ficha jugador not found")