from fastapi import APIRouter, Query, Response, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app import models
from datetime import date
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from io import BytesIO

router = APIRouter(prefix="/reportes", tags=["Reportes"])


@router.get("/report/partidos/pdf")
def partidos_report(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(...),
    db: Session = Depends(get_db),
):
    # 1. Query partido
    start_date = date(year, month, 1)
    next_month_year = year + (1 if month == 12 else 0)
    next_month = 1 if month == 12 else month + 1
    end_date = date(next_month_year, next_month, 1)

    partidos = (
        db.query(models.Partido)
        .filter(
            models.Partido.fecha_partido >= start_date,
            models.Partido.fecha_partido < end_date,
        )
        .all()
    )

    # 2. Construir PDf
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=landscape(letter))
    styles = getSampleStyleSheet()

    elements = [Paragraph(f"Reporte de Partidos {month}/{year}", styles["Title"])]

    # Header de la tabla
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
            "ID Cancha",
            "Serie Local",
            "Serie Visitante",
        ]
    ]

    # Data de las tablas
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
                p.id_cancha if p.id_cancha else "-",
                p.id_serie_local,
                p.id_serie_visitante,
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

    # Retornar PDF
    return Response(
        pdf,
        headers={
            "Content-Disposition": f"attachment; filename=partidos_{month}_{year}.pdf"
        },
        media_type="application/pdf",
    )
