from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, List
from datetime import date, time, datetime
from ..utils.validaciones import validar_fecha
from ..models.partido import EstadoPartidoEnum, TipoPartidoEnum


class PartidoBase(BaseModel):
    fecha_partido: date
    hora_ini_partido: time
    hora_fin_partido: Optional[time] = None
    goles_local: Optional[int] = None
    goles_visita: Optional[int] = None
    estado_partido: EstadoPartidoEnum = EstadoPartidoEnum.PROGRAMADO
    tipo_partido: TipoPartidoEnum = TipoPartidoEnum.CAMPEONATO
    observaciones: str
    id_cancha: Optional[int] = None
    id_serie_local: int
    id_serie_visitante: int

class PartidoCreate(PartidoBase):
    # Validaciones
    @field_validator("fecha_partido")
    @classmethod
    def validar_fecha_partido(cls, v) -> date:
        return validar_fecha(v, False)


class PartidoRead(PartidoBase):
    id_partido: int
    fecha_creacion: datetime
    fecha_modificacion: datetime
    club_local: str
    club_visitante: str

    model_config = ConfigDict(from_attributes=True)


class PartidoUpdate(BaseModel):
    goles_local: Optional[int] = None
    goles_visita: Optional[int] = None
    estado_partido: Optional[EstadoPartidoEnum] = None
    tipo_partido: Optional[TipoPartidoEnum] = None
    id_cancha: Optional[int] = None
    observaciones: Optional[str] = None
