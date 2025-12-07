from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_
from app.models import RendimientoPartido, Partido, FichaJugador, Serie, Club
from app.schemas import RendimientoPartidoUpdate, RendimientoPartidoRead
from fastapi import HTTPException, status
from datetime import time

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


def get_rendimientos_partido(id_partido: int, db: Session, current_user: dict) -> dict:
    """
    Obtiene rendimientos de los jugadores de un partido.
    Retorna goles del equipo del usuario y tiempo jugado.
    
    Para no-admins, filtra por id_club del usuario.
    Para admins, retorna todos los rendimientos.
    
    tiempo_jugado = minutos entre hora_ini_partido y hora_fin_partido
    Si hora_fin_partido es NULL, retorna 990 (90 min * 11 jugadores)
    """
    # Obtener partido con sus series y clubs
    db_partido = db.query(Partido).options(
        joinedload(Partido.serie_local).joinedload(Serie.club),
        joinedload(Partido.serie_visitante).joinedload(Serie.club),
    ).filter(Partido.id_partido == id_partido).first()
    
    if not db_partido:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partido no encontrado")

    # Determinar si es admin
    is_admin = bool(current_user.get("asociacion"))
    
    # Calcular tiempo_jugado del partido
    if db_partido.hora_fin_partido is None:
        tiempo_total_minutos = 990  # 90 min * 11 jugadores
    else:
        # Convertir times a minutos
        hora_ini_minutos = db_partido.hora_ini_partido.hour * 60 + db_partido.hora_ini_partido.minute
        hora_fin_minutos = db_partido.hora_fin_partido.hour * 60 + db_partido.hora_fin_partido.minute
        tiempo_total_minutos = max(0, hora_fin_minutos - hora_ini_minutos)

    # Determinar goles y filtro por club
    goles = None
    id_club_usuario = current_user.get("id_club")
    
    print(f"DEBUG: is_admin={is_admin}, id_club_usuario={id_club_usuario}")
    print(f"DEBUG: serie_local={db_partido.serie_local}, serie_visitante={db_partido.serie_visitante}")
    if db_partido.serie_local:
        print(f"DEBUG: serie_local.club={db_partido.serie_local.club}")
    if db_partido.serie_visitante:
        print(f"DEBUG: serie_visitante.club={db_partido.serie_visitante.club}")
    
    if not is_admin:
        if id_club_usuario is None:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso (id_club ausente)")
        
        # Validar que series y clubs existan
        if not db_partido.serie_local or not db_partido.serie_local.club:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Serie local o su club no encontrado")
        if not db_partido.serie_visitante or not db_partido.serie_visitante.club:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Serie visitante o su club no encontrado")
        
        # Determinar si el usuario es del equipo local o visitante
        club_local_id = db_partido.serie_local.club.id_club
        club_visitante_id = db_partido.serie_visitante.club.id_club
        
        print(f"DEBUG: club_local_id={club_local_id}, club_visitante_id={club_visitante_id}, id_club_usuario={id_club_usuario}")
        
        if club_local_id == id_club_usuario:
            print("LLEGAMOS AL GOLES 1")
            goles = db_partido.goles_local
        elif club_visitante_id == id_club_usuario:
            print("LLEGAMOS AL GOLES 2")
            goles = db_partido.goles_visitante
        else:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No perteneces a ninguno de los equipos del partido")

    # Obtener rendimientos del partido
    db_query = db.query(RendimientoPartido).options(
        joinedload(RendimientoPartido.ficha_jugador).joinedload(FichaJugador.serie).joinedload(Serie.club),
        joinedload(RendimientoPartido.ficha_jugador).joinedload(FichaJugador.jugador),
    ).filter(RendimientoPartido.id_partido == id_partido)

    # Si no es admin, filtrar por club del usuario
    if not is_admin:
        db_query = db_query.join(
            FichaJugador, 
            and_(
                RendimientoPartido.rut_jugador == FichaJugador.rut_jugador,
                RendimientoPartido.id_serie == FichaJugador.id_serie,
            )
        ).join(
            Serie,
            FichaJugador.id_serie == Serie.id_serie
        ).filter(Serie.id_club == id_club_usuario)

    db_rendimientos = db_query.all()

    # Construir respuesta con RendimientoPartidoRead
    rendimientos = []
    for r in db_rendimientos:
        rend_dict = {
            "id_partido": r.id_partido,
            "rut_jugador": r.rut_jugador,
            "id_serie": r.id_serie,
            "tiempo_jugado": r.tiempo_jugado,
            "goles": int(r.goles) if r.goles else 0,
            "asistencias": r.asistencias if r.asistencias else 0,
            "amonestaciones": r.amonestaciones,
            "amonestaciones_amarillas": r.amonestaciones_amarillas,
            "amonestaciones_rojas": r.amonestaciones_rojas,
            "primer_nombre": r.ficha_jugador.jugador.primer_nombre,
            "segundo_nombre": r.ficha_jugador.jugador.segundo_nombre,
            "primer_apellido": r.ficha_jugador.jugador.primer_apellido,
            "segundo_apellido": r.ficha_jugador.jugador.segundo_apellido,
        }
        rendimientos.append(RendimientoPartidoRead.model_validate(rend_dict, from_attributes=True))

    # Para admins, si no tiene goles asignados, no lo incluimos en la respuesta
    return {
        "items": rendimientos,
        "goles": goles,
        "tiempo_jugado": tiempo_total_minutos
    }

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