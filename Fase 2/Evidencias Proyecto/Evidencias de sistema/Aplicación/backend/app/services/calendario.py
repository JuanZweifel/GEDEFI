import random
from sqlalchemy.orm import Session
from sqlalchemy import extract
from typing import List
from datetime import datetime, timedelta, date, time
from app.models import Partido, Cancha, Club, Serie
from app.models.partido import EstadoPartidoEnum, TipoPartidoEnum
from app.utils.decorators import handle_audit

SERIES_SABADO = ["Segunda Infantil", "Primera Infantil", "Juveniles", "Super Seniors"]
SERIES_DOMINGO = ["Segunda Adulta", "Primera Adulta", "Seniors", "Serie Honor"]


def saturday_of_week(d: date) -> date:
    days_until_sat = (5 - d.weekday()) % 7
    return d + timedelta(days=days_until_sat)


def calendar_exists_for_year(db: Session, year: int) -> bool:
    existing = (
        db.query(Partido).filter(extract("year", Partido.fecha_partido) == year).first()
    )
    return existing is not None


def generate_year_fixture(db, total_jornadas=17):
    # Obtener clubs activos
    clubs = db.query(Club).filter(Club.club_activo == True).all()

    # Mapeo id → nombre para facilitar acceso
    club_map = {c.id_club: c.nombre_club for c in clubs}
    club_ids = list(club_map.keys())

    # Mezcla aleatoriamente los clubs para variar el fixture
    # De momento se usa una semilla fija para reproducibilidad
    random.seed(12)
    random.shuffle(club_ids)

    n = len(club_ids)
    is_odd = n % 2 != 0

    if is_odd:
        club_ids.append(None)  # Valor dummy para manejar el descanso
        n += 1

    half = n // 2
    fixture = []

    current_list = club_ids[:]
    used_pairs = set()  # Global, para evitar repeticiones en todo el torneo

    for jornada in range(1, total_jornadas + 1):
        matches = []
        resting_clubs = []

        for i in range(half):
            home = current_list[i]
            away = current_list[n - 1 - i]

            # Identifica al club que descansa
            if home is None:
                resting_clubs.append({"id": away, "nombre": club_map.get(away)})
                continue
            if away is None:
                resting_clubs.append({"id": home, "nombre": club_map.get(home)})
                continue

            # Previene repetición de partidos
            if (home, away) in used_pairs or (away, home) in used_pairs:
                continue

            matches.append(
                {
                    "casa": {"id": home, "nombre": club_map[home]},
                    "visitante": {"id": away, "nombre": club_map[away]},
                    "jornada": jornada,
                }
            )
            used_pairs.add((home, away))

        fixture.append(
            {"jornada": jornada, "partidos": matches, "descansa": resting_clubs}
        )

        # Rota para la siguiente fecha/jornada
        current_list = [current_list[0]] + current_list[-1:] + current_list[1:-1]

    return fixture

# TODO: SE DEBE MANEJAR DE MANERA INDIVIDUAL SU REGISTRO DE AUDITORIA
def generate_calendar_for_fixture(
    db, fixture: List[dict], start_date: date
) -> List[Partido]:
    partidos = []

    start_saturday = saturday_of_week(start_date)

    for jornada_info in fixture:
        jornada = jornada_info["jornada"]
        partidos_info = jornada_info["partidos"]

        # Sábado y domingo de la jornada
        saturday_date = start_saturday + timedelta(weeks=jornada - 1)
        sunday_date = saturday_date + timedelta(days=1)

        for m in partidos_info:
            home_club_id = m["casa"]["id"]
            away_club_id = m["visitante"]["id"]

            # Cargar solo series activas de cada club
            home_series = (
                db.query(Serie)
                .filter(Serie.id_club == home_club_id, Serie.serie_activa == False)
                .all()
            )
            away_series = (
                db.query(Serie)
                .filter(Serie.id_club == away_club_id, Serie.serie_activa == False)
                .all()
            )

            # Mapeo por nombre_serie
            home_map = {s.nombre_serie: s for s in home_series}
            away_map = {s.nombre_serie: s for s in away_series}

            # Crear partidos del sábado
            for serie_name in SERIES_SABADO:
                hs = home_map.get(serie_name)
                as_ = away_map.get(serie_name)
                if hs and as_:
                    partido = Partido(
                        fecha_partido=saturday_date,
                        hora_ini_partido=time(8, 0),
                        hora_fin_partido=None,
                        #id_cancha=None,  # "Sin asignar"
                        id_serie_local=hs.id_serie,
                        id_serie_visitante=as_.id_serie,
                        # TODO: Recibir el tipo de partido como parametro
                        estado_partido=EstadoPartidoEnum.PROGRAMADO,
                        tipo_partido=TipoPartidoEnum.CAMPEONATO,
                        observaciones="",
                    )
                    partidos.append(partido)

            # Domingo
            for serie_name in SERIES_DOMINGO:
                hs = home_map.get(serie_name)
                as_ = away_map.get(serie_name)
                if hs and as_:
                    partido = Partido(
                        fecha_partido=sunday_date,
                        hora_ini_partido=time(8, 0),
                        hora_fin_partido=None,
                        #id_cancha=0,
                        id_serie_local=hs.id_serie,
                        id_serie_visitante=as_.id_serie,
                        # TODO: Recibir el tipo de partido como parametro
                        estado_partido=EstadoPartidoEnum.PROGRAMADO,
                        tipo_partido=TipoPartidoEnum.CAMPEONATO,
                        observaciones="",
                    )
                    partidos.append(partido)

    return partidos
