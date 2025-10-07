from datetime import date,datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict, field_validator
from ..utils.validaciones import validar_nombre, validar_fecha

class LesionBase(BaseModel):
    nombre_lesion: str
    tipo_lesion: bool
    descripcion: str
    tiempo_recuperacion: Optional[int] = None
    fecha_lesion: Optional[date] = None
    fecha_fin_lesion: Optional[date] = None

    @field_validator("nombre_lesion")
    @classmethod
    def validar_nombre_lesion(cls, v) -> str:
        return validar_nombre(v)

    @field_validator("fecha_lesion")
    @classmethod
    def validar_fecha_lesion(cls, v) -> date:
        return validar_fecha(v, True)

    @field_validator("fecha_fin_lesion")
    @classmethod
    def validar_fecha_fin_lesion(cls, v) -> date:
        return validar_fecha(v, False)


class LesionCreate(LesionBase):
    rut_jugador: str

class LesionRead(LesionBase):
    id_lesion: int
    rut_jugador: str
    fecha_creacion: Optional[datetime] = None
    fecha_modificacion: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class LesionUpdate(BaseModel):
    nombre_lesion: Optional[str] = None
    tipo_lesion: Optional[bool] = None
    descripcion: Optional[str] = None
    tiempo_recuperacion: Optional[int] = None
    fecha_lesion: Optional[date] = None
    fecha_fin_lesion: Optional[date] = None