from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import date
from .partido import PartidoRead  

class CanchaBase(BaseModel):
    nombre_cancha: str
    tipo_cancha: int
    direccion: Optional[str] = None
    disponibilidad: bool
    cancha_activa: bool
    fecha_creacion: date
    fecha_modificacion: date

class CanchaCreate(CanchaBase):
    pass

class CanchaRead(CanchaBase):
    id_cancha: int
    model_config = ConfigDict(from_attributes=True)

class CanchaUpdate(BaseModel):
    nombre_cancha: Optional[str] = None
    tipo_cancha: Optional[int] = None
    direccion: Optional[str] = None
    disponibilidad: Optional[bool] = None
    cancha_activa: Optional[bool] = None
    fecha_creacion: Optional[date] = None
    fecha_modificacion: Optional[date] = None

class CanchaReadWithPartidos(CanchaRead):
    partido: List[PartidoRead] = Field(default_factory=list)