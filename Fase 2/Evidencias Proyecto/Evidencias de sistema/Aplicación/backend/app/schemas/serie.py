from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List
from .jugador import JugadorRead
from ..utils.validaciones import validar_nombre
from datetime import datetime

class SerieBase(BaseModel):
    nombre_serie: str = Field(..., max_length=30, description="Nombre de la serie")
    id_club: int = Field(..., description="ID del club asociado a la serie")

    @field_validator("nombre_serie", mode="before")
    @classmethod
    def validar_nombre_serie(cls, v) -> str:
        return validar_nombre(v)


class SerieCreate(SerieBase):
    pass


class SerieUpdate(BaseModel):
    state: bool

class SerieRead(SerieBase):
    id_serie: int
    serie_activa: bool
    fecha_creacion: datetime
    fecha_modificacion: datetime
    class Config:
        from_attributes = True

class SerieWithDetails(SerieRead):
    nombre_club: str
    cantidad_jugadores: int
    jugadores: list[JugadorRead] = Field(default_factory=list)

    class Config: 
        from_attributes = True

class SerieList(BaseModel):
    series: List[SerieRead] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


