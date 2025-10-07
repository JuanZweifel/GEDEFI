from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date

class DetalleClubJugadorBase(BaseModel):
    fecha_ini: date
    fecha_fin: Optional[date] = None

class DetalleClubJugadorCreate(DetalleClubJugadorBase):
    rut_jugador: str
    id_club: int

class DetalleClubJugadorRead(DetalleClubJugadorBase):
    rut_jugador: str
    id_club: int
    model_config = ConfigDict(from_attributes=True)

class DetalleClubJugadorUpdate(BaseModel):
    fecha_ini: Optional[date] = None
    fecha_fin: Optional[date] = None
