from datetime import date
from io import BytesIO
from typing import List
from sqlalchemy.orm import Session
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from app.models.partido import Partido
from sqlalchemy.orm import joinedload


def get_partidos_by_month(db: Session, month: int, year: int) -> List[Partido]:
    start_date = date(year, month, 1)
    next_month_year = year + (1 if month == 12 else 0)
    next_month = 1 if month == 12 else month + 1
    end_date = date(next_month_year, next_month, 1)

    partidos = (
        db.query(Partido)
        .options(
            joinedload(Partido.cancha),
            joinedload(Partido.serie_local),
            joinedload(Partido.serie_visitante),
        )
        .filter(
            Partido.fecha_partido >= start_date,
            Partido.fecha_partido < end_date,
        )
        .all()
    )
    return partidos


def generate_partidos_pdf(partidos: List[Partido], month: int, year: int) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=landscape(letter))
    styles = getSampleStyleSheet()

    elements = [Paragraph(f"Reporte de Partidos {month}/{year}", styles["Title"])]

    # Table header
    data = [
        [
            "ID Partido",
            "Fecha",
            "Hora Inicio",
            "Hora Fin",
            "Goles Local",
            "Goles Visita",
            "Estado",
            "Tipo",
            "Cancha",
            "Serie Local",
            "Serie Visitante",
        ]
    ]

    # Table rows
    for p in partidos:
        data.append(
            [
                p.id_partido,
                p.fecha_partido.isoformat(),
                p.hora_ini_partido.strftime("%H:%M"),
                p.hora_fin_partido.strftime("%H:%M") if p.hora_fin_partido else "-",
                p.goles_local,
                p.goles_visita,
                p.estado_partido.value,
                p.tipo_partido.value,
                p.cancha.nombre_cancha if p.cancha else "-",
                p.serie_local.nombre_serie if p.serie_local else "-",
                (p.serie_visitante.nombre_serie if p.serie_visitante else "-"),
            ]
        )

    table = Table(data, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("GRID", (0, 0), (-1, -1), 1, colors.black),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ]
        )
    )

    elements.append(table)
    doc.build(elements)
    pdf = buffer.getvalue()
    buffer.close()
    return pdf