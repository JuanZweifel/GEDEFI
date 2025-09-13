from datetime import date
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from .asistencia_reunion import AsistenciaReunionRead


class ReunionBase(BaseModel):
    tipo_reunion: int
    fecha_reunion: date
    desc_reunion: Optional[str] = None


class ReunionCreate(ReunionBase):
    pass


class ReunionRead(ReunionBase):
    id_reunion: int
    model_config = ConfigDict(from_attributes=True)


class ReunionUpdate(BaseModel):
    tipo_reunion: Optional[int] = None
    fecha_reunion: Optional[date] = None
    desc_reunion: Optional[str] = None


class ReunionReadWithAsistencia(ReunionRead):
    asistencias: List[AsistenciaReunionRead] = Field(default_factory=list)
