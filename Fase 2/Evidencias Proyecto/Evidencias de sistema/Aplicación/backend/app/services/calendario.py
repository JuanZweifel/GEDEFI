import random
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date, time
from app.models import Serie
from app.models import Partido, Cancha


def generate_year_fixture(db, total_jornadas=17):
    # Obtener series activas
    series = db.query(Serie).filter(Serie.activa == True).all()
    series_ids = [s.id_serie for s in series]

    n = len(series_ids)
    is_odd = n % 2 != 0

    if is_odd:
        series_ids.append(None)  # Valor dummy
        n += 1

    half = n // 2
    fixture = []

    current_list = series_ids[:]

    for jornada in range(1, total_jornadas + 1):
        pairs = []
        used_pairs = set()

        for i in range(half):
            home = current_list[i]
            away = current_list[n - 1 - i]

            if home is None or away is None:
                continue

            # Previene repiticion de partidos
            if (home, away) in used_pairs or (away, home) in used_pairs:
                continue

            pairs.append((home, away, jornada))
            used_pairs.add((home, away))

        fixture.extend(pairs)
        # Rota para la siguiente fecha/jornada
        current_list = [current_list[0]] + current_list[-1:] + current_list[1:-1]

    return fixture


def generate_calendar_for_fixture(db, fixture, start_date: date):
    while start_date.weekday() != 5:
        start_date += timedelta(days=1)

    fields = db.query(Cancha).filter(Cancha.disponible == True).all()
    hours = [time(10, 0), time(12, 0), time(14, 0), time(16, 0)]

    partidos = []

    for local_id, visitante_id, jornada in fixture:
        # Jornada = start + (jornada-1)
        base_date = start_date + timedelta(weeks=jornada - 1)
        match_date = base_date + timedelta(
            days=random.choice([0, 1])
        )  # Sabado o Domingo
        cancha = random.choice(fields)
        match_time = random.choice(hours)

        partido = Partido(
            fecha_partido=datetime.combine(match_date, match_time),
            goles_local=None,
            goles_visita=None,
            partido_activo=True,
            id_cancha=cancha.id_cancha,
            id_serie_local=local_id,
            id_serie_visitante=visitante_id,
        )
        db.add(partido)
        partidos.append(partido)

    db.commit()
    return partidos
