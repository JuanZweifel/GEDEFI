from datetime import date
from pydantic import BaseModel
from typing import Optional, List


class EstadisticaJugadorBase(BaseModel):
    rut_jugador: str
    id_serie: int
    id_partido: int
    goles: int
    asistencias: int
    faltas: int
    fecha_medicion: date
    tarjetas_amarillas: int
    tarjetas_rojas: int


class EstadisticaJugadorCreate(EstadisticaJugadorBase):
    pass


class EstadisticaJugadorRead(EstadisticaJugadorBase):
    rut_jugador: str
    id_serie: int
    id_partido: int

    class Config:
        from_attributes = True


class EstadisticaJugadorUpdate(BaseModel):
    goles: Optional[int] = None
    asistencias: Optional[int] = None
    faltas: Optional[int] = None
    fecha_medicion: Optional[date] = None
    tarjetas_amarillas: Optional[int] = None
    tarjetas_rojas: Optional[int] = None


class EstadisticaJugadorWithDetails(EstadisticaJugadorRead):
    # Hay que evaluar que debera retornar esto
    pass
