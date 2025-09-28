from datetime import date
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List

class ReunionBase(BaseModel):
    asistencia: bool
    hora_llegada: Optional[str] = None
    hora_salida: Optional[str] = None

class DetalleReunionCreate(ReunionBase):
    rut_usuario: int = Field(..., description="ID del usuario")
    reunion_id: int = Field(..., description="ID de la reunión")

class DetalleReunionUpdate(BaseModel):
    asistencia: Optional[bool] = None
    hora_llegada: Optional[str] = None
    hora_salida: Optional[str] = None

class DetalleReunionRead(ReunionBase):
    id_detalle_reunion: int
    rut_usuario: int = Field(..., description="ID del usuario")
    reunion_id: int = Field(..., description="ID de la reunión")

    model_config = ConfigDict(from_attributes=True)

class DetalleReunionList(BaseModel):
    detalles_reunion: List[DetalleReunionRead] = Field(default_factory=list, description="Lista de asistencias de reuniones")
