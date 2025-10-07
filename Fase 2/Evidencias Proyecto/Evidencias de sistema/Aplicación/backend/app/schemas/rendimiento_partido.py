from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import date

class RendimientoPartidoBase(BaseModel):
    tiempo_jugado: Optional[int] = None
    goles: str
    asistencias: int
    amonestaciones: Optional[str] = None
    amonestaciones_amarillas: bool
    amonestaciones_rojas: bool
    fecha_ini: date

class RendimientoPartidoCreate(RendimientoPartidoBase):
    id_partido: int
    rut_jugador: str
    id_serie: int

class RendimientoPartidoRead(RendimientoPartidoBase):
    id_partido: int
    rut_jugador: str
    id_serie: int
    model_config = ConfigDict(from_attributes=True)

class RendimientoPartidoUpdate(BaseModel):
    tiempo_jugado: Optional[int] = None
    goles: Optional[str] = None
    asistencias: Optional[int] = None
    amonestaciones: Optional[str] = None
    amonestaciones_amarillas: Optional[bool] = None
    amonestaciones_rojas: Optional[bool] = None
    fecha_ini: Optional[date] = None

