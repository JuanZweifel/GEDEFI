from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date, datetime

class FichaJugadorBase(BaseModel):
    fecha_ini: Optional[date] = None
    fecha_fin: Optional[date] = None
    talla_camiseta: Optional[str] = None
    talla_short: Optional[str] = None
    talla_media: Optional[str] = None
    talla_botin: Optional[str] = None
    estatura: Optional[int] = None
    Peso: Optional[int] = None
    imc: Optional[int] = None
    

class FichaJugadorCreate(FichaJugadorBase):
    rut_jugador: str
    id_serie: int
    fecha_ini: Optional[date] = None

class FichaJugadorRead(FichaJugadorBase):
    rut_jugador: str
    id_serie: int
    fecha_creacion: datetime
    fecha_modificacion: datetime
    model_config = ConfigDict(from_attributes=True)

class FichaJugadorUpdate(BaseModel):
    fecha_ini: Optional[date] = None
    fecha_fin: Optional[date] = None
    talla_camiseta: Optional[str] = None
    talla_short: Optional[str] = None
    talla_media: Optional[str] = None
    talla_botin: Optional[str] = None
    estatura: Optional[int] = None
    Peso: Optional[int] = None
    imc: Optional[int] = None

