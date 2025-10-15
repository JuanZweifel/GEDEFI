from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from typing import Optional
from app.db import get_db
from app.services import calendario

router = APIRouter(prefix="/calendario", tags=["Calendario"])


@router.post("/fixture")
def generate_fixture(total_jornadas: Optional[int] = 17, db: Session = Depends(get_db)):
    fixture = calendario.generate_year_fixture(db, total_jornadas)
    return {"fixture": fixture}


@router.post("/calendar")
def generate_calendar(
    start_date: date,
    total_jornadas: Optional[int] = 17,
    db: Session = Depends(get_db),
):
    fixture = calendario.generate_year_fixture(db, total_jornadas)

    try:
        partidos = calendario.generate_calendar_for_fixture(db, fixture, start_date)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {
        "message": "Calendar generated successfully",
        "total_matches": len(partidos),
    }
