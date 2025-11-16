from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_
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


def get_rendimientos_partido(id_partido: int, db: Session, current_user: dict):

    db_partido = db.query(Partido).filter(Partido.id_partido == id_partido)
    if not db_partido: raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partido no encontrado")

    db_rendimientos = db.query(RendimientoPartido).options(
        joinedload(RendimientoPartido.ficha_jugador)
        .joinedload(FichaJugador.serie),
        joinedload(RendimientoPartido.ficha_jugador)
        .joinedload(FichaJugador.jugador)
    )

    if not current_user.get("asociacion"): 
        id = current_user.get("id_club")
        db_rendimientos.filter(and_(Serie.id_club == id, RendimientoPartido.id_partido == id_partido))
    
    db_rendimientos = db_rendimientos.all()

    rendimientos = []

    for r in db_rendimientos:
        rendimiento = RendimientoPartidoRead(
            id_partido=id_partido,
            rut_jugador=r.rut_jugador,
            id_serie=r.id_serie,
            tiempo_jugado=r.tiempo_jugado,
            goles=int(r.goles),
            asistencias=r.asistencias,
            amonestaciones=int(r.amonestaciones),
            amonestaciones_amarillas=r.amonestaciones_amarillas,
            amonestaciones_rojas=r.amonestaciones_rojas,
            primer_nombre=r.ficha_jugador.jugador.primer_nombre,
            segundo_nombre=r.ficha_jugador.jugador.segundo_nombre,
            primer_apellido=r.ficha_jugador.jugador.primer_apellido,
            segundo_apellido=r.ficha_jugador.jugador.segundo_apellido
        )

        rendimientos.append(rendimiento)
    return rendimientos

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
            fecha_ini=ficha.fecha_ini,
            tiempo_jugado=None,
            goles=0,
            asistencias=0,
            amonestaciones=0,
            amonestaciones_amarillas=False,
            amonestaciones_rojas=False,
        )
        rendimientos.append(rendimiento)
    db.add_all(rendimientos)
    db.flush()
    return True


def update_rendimiento_partido(
    db: Session, current_user:dict, id_partido: int, rendimientos: list[RendimientoPartidoUpdate]
) -> bool:
    
    db_partido = db.query(Partido).options(joinedload(Partido.serie_local), joinedload(Partido.serie_visitante)).filter(Partido.id_partido == id_partido).first()

    if not db_partido: 
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Partido no encontrado"
        ) 
    
    if db_partido.serie_local.id_club == current_user.get("id_club"): serie=db_partido.id_serie_local
    elif db_partido.serie_visitante.id_club == current_user.get("id_club"):serie=db_partido.id_serie_visitante
    else: 
        raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"No tienes permiso para modificar rendimientos de otro club"
            )
    for r in rendimientos:
        db_rend = db.query(RendimientoPartido).filter(
            RendimientoPartido.id_partido == id_partido,
            RendimientoPartido.id_serie == serie,
            RendimientoPartido.rut_jugador == r.rut_jugador
        ).first()

        if not db_rend:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Rendimiento no encontrado para {r.rut_jugador}"
            )

        # Actualizar los campos enviados
        data = r.dict(exclude={"rut_jugador"}, exclude_unset=True)

        for key, value in data.items():
            setattr(db_rend, key, value)

    db.commit()
    return True


def delete_rendimiento_partido(db: Session, id_partido: int, rut_jugador: str, id_serie: int) -> bool:
    db_rendimiento = get_rendimiento_partido(db, id_partido, rut_jugador, id_serie)
    if not db_rendimiento:
        return False
    db.delete(db_rendimiento)
    db.commit()
    return True