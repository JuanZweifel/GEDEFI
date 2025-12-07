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

MATCH_DURATION = timedelta(hours=1, minutes=30)
START_TIME = time(9, 0)


def saturday_of_week(d: date) -> date:
    days_until_sat = (5 - d.weekday()) % 7
    return d + timedelta(days=days_until_sat)


def calendar_exists_for_year(db: Session, year: int) -> bool:
    existing = (
        db.query(Partido).filter(extract("year", Partido.fecha_partido) == year).first()
    )
    return existing is not None


def generate_year_fixture(db, total_jornadas=17):
    clubs = db.query(Club).all()

    club_map = {c.id_club: c.nombre_club for c in clubs}
    club_ids = list(club_map.keys())

    random.seed(12)
    random.shuffle(club_ids)

    n = len(club_ids)
    is_odd = n % 2 != 0

    if is_odd:
        club_ids.append(None)
        n += 1

    half = n // 2
    fixture = []
    current_list = club_ids[:]
    used_pairs = set()

    for jornada in range(1, total_jornadas + 1):
        matches = []
        resting_clubs = []

        for i in range(half):
            home = current_list[i]
            away = current_list[n - 1 - i]

            if home is None:
                resting_clubs.append({"id": away, "nombre": club_map.get(away)})
                continue
            if away is None:
                resting_clubs.append({"id": home, "nombre": club_map.get(home)})
                continue

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

        current_list = [current_list[0]] + current_list[-1:] + current_list[1:-1]

    return fixture


def generate_calendar_for_fixture(
    db, fixture: List[dict], start_date: date
) -> List[Partido]:
    partidos = []

    # Canchas activas
    canchas = db.query(Cancha).filter(Cancha.cancha_activa == True).all()
    if not canchas:
        raise Exception("No hay canchas activas registradas.")

    # Agenda de reservas por cancha y fecha
    booking = {}

    def get_next_slot(fecha: date, cancha_id: int) -> time:
        """Returns next free time on a given cancha for a given date."""
        if fecha not in booking:
            booking[fecha] = {}

        if cancha_id not in booking[fecha]:
            booking[fecha][cancha_id] = []
            return START_TIME

        used_times = booking[fecha][cancha_id]

        if not used_times:
            return START_TIME

        last_start = used_times[-1]
        next_dt = (datetime.combine(fecha, last_start) + MATCH_DURATION).time()

        return next_dt

    start_saturday = saturday_of_week(start_date)

    # Jornadas
    for jornada_info in fixture:
        jornada = jornada_info["jornada"]
        partidos_info = jornada_info["partidos"]

        saturday = start_saturday + timedelta(weeks=jornada - 1)
        sunday = saturday + timedelta(days=1)

        for match in partidos_info:
            home_id = match["casa"]["id"]
            away_id = match["visitante"]["id"]

            home_series = db.query(Serie).filter(Serie.id_club == home_id).all()
            away_series = db.query(Serie).filter(Serie.id_club == away_id).all()

            home_map = {s.nombre_serie: s for s in home_series}
            away_map = {s.nombre_serie: s for s in away_series}

            # SÁBADO
            for serie_name in SERIES_SABADO:
                hs = home_map.get(serie_name)
                as_ = away_map.get(serie_name)

                if hs and as_:
                    cancha = random.choice(canchas)
                    slot_time = get_next_slot(saturday, cancha.id_cancha)

                    end_time = (
                        datetime.combine(saturday, slot_time) + MATCH_DURATION
                    ).time()

                    partido = Partido(
                        fecha_partido=saturday,
                        hora_ini_partido=slot_time,
                        hora_fin_partido=end_time,
                        id_cancha=cancha.id_cancha,
                        id_serie_local=hs.id_serie,
                        id_serie_visitante=as_.id_serie,
                        estado_partido=EstadoPartidoEnum.PROGRAMADO,
                        tipo_partido=TipoPartidoEnum.CAMPEONATO,
                        observaciones="",
                    )

                    booking[saturday][cancha.id_cancha].append(slot_time)
                    partidos.append(partido)

            # DOMINGO
            for serie_name in SERIES_DOMINGO:
                hs = home_map.get(serie_name)
                as_ = away_map.get(serie_name)

                if hs and as_:
                    cancha = random.choice(canchas)
                    slot_time = get_next_slot(sunday, cancha.id_cancha)

                    end_time = (
                        datetime.combine(saturday, slot_time) + MATCH_DURATION
                    ).time()

                    partido = Partido(
                        fecha_partido=sunday,
                        hora_ini_partido=slot_time,
                        hora_fin_partido=end_time,
                        id_cancha=cancha.id_cancha,
                        id_serie_local=hs.id_serie,
                        id_serie_visitante=as_.id_serie,
                        estado_partido=EstadoPartidoEnum.PROGRAMADO,
                        tipo_partido=TipoPartidoEnum.CAMPEONATO,
                        observaciones="",
                    )

                    booking[sunday][cancha.id_cancha].append(slot_time)
                    partidos.append(partido)

    return partidos
