from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, List
from datetime import date
from .partido import PartidoRead  
from ..utils.validaciones import validar_nombre

class CanchaBase(BaseModel):
    nombre_cancha: str
    tipo_cancha: int
    direccion: Optional[str] = None
    disponibilidad: bool
    cancha_activa: bool

    # Validaciones
    @field_validator("nombre_cancha", mode="before")
    @classmethod
    def validar_nombre_cancha(cls, v) -> str:
        return validar_nombre(v)

class CanchaCreate(CanchaBase):
    pass

class CanchaRead(CanchaBase):
    id_cancha: int
    fecha_creacion: date
    fecha_modificacion: date
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