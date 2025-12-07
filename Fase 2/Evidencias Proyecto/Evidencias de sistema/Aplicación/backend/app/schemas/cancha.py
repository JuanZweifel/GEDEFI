from enum import Enum
from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, List
from datetime import datetime, date
from .partido import PartidoRead
from ..utils.validaciones import validar_nombre
from ..models.cancha import SuperficieEnum


class InstalacionesEnum(str, Enum):
    ILUMINACION = "Iluminación"
    TRIBUNAS = "Tribunas"
    CAMARINES = "Camarines"
    ESTACIONAMIENTO = "Estacionamiento"
    BANOS = "Baños"
    ENFERMERIA = "Enfermería"


class CanchaBase(BaseModel):
    nombre_cancha: str
    superficie_cancha: SuperficieEnum
    direccion: Optional[str] = None
    cancha_activa: bool
    ultimo_mantenimiento: Optional[date] = None
    observaciones: Optional[str] = None
    instalaciones: List[InstalacionesEnum] = Field(
        default_factory=list,
        description="Lista de instalaciones disponibles en la cancha",
    )

    # Validaciones
    @field_validator("nombre_cancha", mode="before")
    @classmethod
    def validar_nombre_cancha(cls, v) -> str:
        return validar_nombre(v)


class CanchaCreate(CanchaBase):
    pass


class CanchaRead(CanchaBase):
    id_cancha: int
    fecha_creacion: datetime
    fecha_modificacion: datetime
    model_config = ConfigDict(from_attributes=True)


class CanchaUpdate(BaseModel):
    nombre_cancha: Optional[str] = None
    superficie_cancha: Optional[SuperficieEnum] = None
    ultimo_mantenimiento: Optional[date] = None
    direccion: Optional[str] = None
    cancha_activa: Optional[bool] = None
    observaciones: Optional[str] = None
    instalaciones: Optional[List[InstalacionesEnum]] = None


class CanchaReadWithPartidos(CanchaRead):
    partido: List[PartidoRead] = Field(default_factory=list)
