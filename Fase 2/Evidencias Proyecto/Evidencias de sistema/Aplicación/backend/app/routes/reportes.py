from fastapi import APIRouter, Response, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.services import reporte

router = APIRouter(prefix="/reportes", tags=["Reportes"])


@router.get("/partidos")
def partidos_report(month: int, year: int, db: Session = Depends(get_db)):
    partidos = reporte.get_partidos_by_month(db, month, year)

    pdf_bytes = reporte.generate_partidos_pdf(partidos, month, year)

    return Response(
        pdf_bytes,
        headers={
            "Content-Disposition": f"attachment; filename=partidos_{month}_{year}.pdf"
        },
        media_type="application/pdf",
    )
