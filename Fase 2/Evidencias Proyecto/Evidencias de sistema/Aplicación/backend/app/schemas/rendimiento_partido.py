from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import date

class RendimientoPartidoBase(BaseModel):
    id_partido: int
    rut_jugador: str
    id_serie: int
    tiempo_jugado: Optional[int] = None
    goles: Optional[int]
    asistencias: Optional[int]
    amonestaciones: Optional[int] = None
    amonestaciones_amarillas: Optional[bool] = None
    amonestaciones_rojas: Optional[bool] = None

class RendimientoPartidoCreate(RendimientoPartidoBase):
    pass

class RendimientoPartidoRead(RendimientoPartidoBase):
    primer_nombre: str
    segundo_nombre: Optional[str] = None
    primer_apellido: str
    segundo_apellido: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class RendimientoPartidoUpdate(BaseModel):
    rut_jugador: str
    tiempo_jugado: Optional[int] = None
    goles: Optional[int] = None
    asistencias: Optional[int] = None
    amonestaciones: Optional[int] = None
    amonestaciones_amarillas: Optional[bool] = None
    amonestaciones_rojas: Optional[bool] = None

