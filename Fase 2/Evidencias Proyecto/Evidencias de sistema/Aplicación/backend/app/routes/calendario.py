from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date
from typing import Optional
from app.db import get_db
from app.services.calendario import (
    generate_year_fixture,
    generate_calendar_for_fixture,
    calendar_exists_for_year,
)

router = APIRouter(prefix="/calendario", tags=["Calendario"])


@router.post("/fixture")
def generate_fixture(total_jornadas: Optional[int] = 17, db: Session = Depends(get_db)):
    fixture = generate_year_fixture(db, total_jornadas)
    return {"fixture": fixture}


@router.post("/calendar")
def generate_calendar(
    start_date: date, total_jornadas: int, db: Session = Depends(get_db)
):
    year = start_date.year

    if calendar_exists_for_year(db, year):
        raise HTTPException(
            status_code=400,
            detail=f"Ya existe un calendario para el año {year}.",
        )

    try:
        fixture = generate_year_fixture(db, total_jornadas)
        if not fixture:
            raise HTTPException(
                status_code=400, detail="No se pudo generar el fixture."
            )

        partidos = generate_calendar_for_fixture(db, fixture, start_date)

        db.add_all(partidos)
        db.commit()

        for p in partidos:
            db.refresh(p)

        return {
            "message": "Calendario generado exitosamente",
            "total_partidos": len(partidos),
            "primera_fecha": partidos[0].fecha_partido if partidos else None,
            "ultima_fecha": partidos[-1].fecha_partido if partidos else None,
        }

    except Exception as e:
        db.rollback()
        print("error calendario")
        print(e)
        raise HTTPException(
            status_code=500, detail=f"Error al crear el calendario: {e}"
        )