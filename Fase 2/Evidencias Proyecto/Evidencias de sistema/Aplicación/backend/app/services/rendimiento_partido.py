from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from app.models import RendimientoPartido, Partido, FichaJugador, Serie
from app.schemas import RendimientoPartidoUpdate, RendimientoPartidoRead
from fastapi import HTTPException, status

def get_rendimientos_partido_club(db: Session, id_club: int, id_partido: int) -> list[RendimientoPartidoRead]:
    rendimientos = (
        db.query(RendimientoPartido)
        .options(
            joinedload(RendimientoPartido.ficha_jugador)
            .joinedload(FichaJugador.jugador),
            joinedload(RendimientoPartido.ficha_jugador)
            .joinedload(FichaJugador.serie)
        )
        .join(FichaJugador, RendimientoPartido.rut_jugador == FichaJugador.rut_jugador)
        .join(Serie, FichaJugador.id_serie == Serie.id_serie)
        .filter(
            RendimientoPartido.id_partido == id_partido,
            Serie.id_club == id_club
        )
        .all()
    )

    # Mapear cada rendimiento y agregar los nombres desde ficha_jugador.jugador
    resultado = []
    for r in rendimientos:
        jugador = r.ficha_jugador.jugador
        rp_dict = r.__dict__.copy()  # copiar los campos de RendimientoPartido
        rp_dict.update({
            "primer_nombre": jugador.primer_nombre,
            "segundo_nombre": jugador.segundo_nombre,
            "primer_apellido": jugador.primer_apellido,
            "segundo_apellido": jugador.segundo_apellido,
        })
        resultado.append(RendimientoPartidoRead.model_validate(rp_dict))
    
    return resultado


def get_rendimientos_partido(db: Session, skip: int = 0, limit: int = 100):
    return db.query(RendimientoPartido).offset(skip).limit(limit).all()


def create_rendimiento_partido(db: Session, id_partido: int) -> bool:
    db_partido = db.query(Partido).filter(Partido.id_partido == id_partido).first()
    if not db_partido:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partido no encontrado")

    serie_local = db_partido.serie_local
    serie_visitante = db_partido.serie_visitante

    if not serie_local or not serie_visitante:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Series del partido no encontradas")

    jugadores_local = db.query(FichaJugador).options(joinedload(FichaJugador.jugador)).filter(
        and_(
            FichaJugador.id_serie == serie_local.id_serie,
            FichaJugador.fecha_ini <= db_partido.fecha_partido,
            FichaJugador.fecha_fin == None
        )
    ).all()

    jugadores_visitante = db.query(FichaJugador).options(joinedload(FichaJugador.jugador)).filter(
        and_(
            FichaJugador.id_serie == serie_visitante.id_serie,
            FichaJugador.fecha_ini <= db_partido.fecha_partido,
            FichaJugador.fecha_fin == None
        )
    ).all()

    rendimientos = []
    
    for ficha in jugadores_local + jugadores_visitante:
        rendimiento = RendimientoPartido(
            id_partido=id_partido,
            rut_jugador=ficha.jugador.rut_jugador,
            id_serie=ficha.id_serie,
            tiempo_jugado=None,
            goles=0,
            asistencias=0,
            amonestaciones=0,
            amonestaciones_amarillas=False,
            amonestaciones_rojas=False,
        )
        rendimientos.append(rendimiento)

    db.add_all(rendimientos)
    print("LLEGAMOS LUCHO")
    db.flush()
    return True


def update_rendimiento_partido(
    db: Session, id_partido: int, rut_jugador: str, id_serie: int, rendimiento_update: RendimientoPartidoUpdate
) -> RendimientoPartido | None:
    db_rendimiento = get_rendimiento_partido(db, id_partido, rut_jugador, id_serie)
    if not db_rendimiento:
        return None
    for key, value in rendimiento_update.dict(exclude_unset=True).items():
        setattr(db_rendimiento, key, value)
    db.commit()
    db.refresh(db_rendimiento)
    return db_rendimiento


def delete_rendimiento_partido(db: Session, id_partido: int, rut_jugador: str, id_serie: int) -> bool:
    db_rendimiento = get_rendimiento_partido(db, id_partido, rut_jugador, id_serie)
    if not db_rendimiento:
        return False
    db.delete(db_rendimiento)
    db.commit()
    return True