from datetime import date
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional, List
from .detalle_reunion import DetalleReunionRead
from ..utils.validaciones import validar_fecha
from datetime import time, datetime


class ReunionBase(BaseModel):
    tipo_reunion: int = Field(..., ge=0, le=4, description="Tipo de reunión")
    hora_reunion: time = Field(..., description="Hora de la reunión")
    titulo_reunion: str = Field(..., max_length=320, description="Título de la reunión")
    fecha_reunion: date = Field(..., description="Fecha de la reunión")
    lugar_reunion: str = Field(
        ..., max_length=500, description="Lugar donde se realizará la reunión"
    )
    desc_reunion: Optional[str] = Field(
        None, max_length=500, description="Descripción de la reunión"
    )


class ReunionCreate(ReunionBase):
    @field_validator("fecha_reunion")
    @classmethod
    def validar_fecha_creacion(cls, v):
        return validar_fecha(v, False)


class ReunionRead(ReunionBase):
    id_reunion: int
    model_config = ConfigDict(from_attributes=True)


class ReunionUpdate(BaseModel):
    tipo_reunion: Optional[int] = None
    fecha_reunion: Optional[date] = None
    desc_reunion: Optional[str] = None

    @field_validator("fecha_reunion")
    @classmethod
    def validar_fecha_update(cls, v):
        if v is None:
            return v
        return validar_fecha(v, False)


class AsistenciaRequest(BaseModel):
    rut_usuario: str
    id_reunion: int
    hora_llegada: datetime | None = None
    hora_salida: datetime | None = None


class ReunionReadWithAsistencia(ReunionRead):
    asistencias: List[DetalleReunionRead] = Field(default_factory=list)


class ReunionList(BaseModel):
    reuniones: List[ReunionRead] = Field(default_factory=list)
