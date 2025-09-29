from datetime import date
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from .detalle_reunion import DetalleReunionRead


class ReunionBase(BaseModel):
    tipo_reunion: int = Field(..., ge=0, le=4, description="Tipo de reunión")
    fecha_reunion: date = Field(..., description="Fecha de la reunión")
    desc_reunion: Optional[str] = Field(
        None, max_length=500, description="Descripción de la reunión"
    )


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
    asistencias: List[DetalleReunionRead] = Field(default_factory=list)


class ReunionList(BaseModel):
    reuniones: List[ReunionRead] = Field(default_factory=list)
