from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, List
from datetime import date
from ..utils.validaciones import validar_fecha


class PartidoBase(BaseModel):
    fecha_partido: date
    goles_local: Optional[int] = None
    goles_visita: Optional[int] = None
    partido_activo: bool
    id_cancha: int
    serie_local: int
    serie_visita: int

        # Validaciones
    @field_validator("fecha_partido")
    @classmethod
    def validar_fecha_partido(cls, v) -> date:
        return validar_fecha(v, False)

class PartidoCreate(PartidoBase):
    pass

class PartidoRead(PartidoBase):
    id_partido: int
    fecha_creacion: date
    fecha_modificacion: date
    model_config = ConfigDict(from_attributes=True)

class PartidoUpdate(BaseModel):
    fecha_partido: Optional[date] = None
    goles_local: Optional[int] = None
    goles_visita: Optional[int] = None
    partido_activo: Optional[bool] = None
    id_cancha: Optional[int] = None
    serie_local: Optional[int] = None
    serie_visita: Optional[int] = None
