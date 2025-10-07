from datetime import datetime
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List


class AuditoriaBase(BaseModel):
    recurso: str = Field(..., max_length=50, description="Nombre del recurso afectado")
    id_recurso: int = Field(..., ge=1, description="ID del recurso afectado")
    descripcion: Optional[str] = Field(
        None, max_length=500, description="Descripción de la auditoría"
    )
    accion_realizada: str = Field(
        ..., max_length=100, description="Acción realizada sobre el recurso"
    )
    usuario: int = Field(..., ge=1, description="ID del usuario que realizó la acción")


class AuditoriaCreate(AuditoriaBase):
    pass


class AuditoriaUpdate(BaseModel):
    recurso: Optional[str] = Field(None, max_length=50)
    id_recurso: Optional[int] = Field(None, ge=1)
    descripcion: Optional[str] = Field(None, max_length=500)
    accion_realizada: Optional[str] = Field(None, max_length=100)
    usuario: Optional[int] = Field(None, ge=1)


class AuditoriaRead(AuditoriaBase):
    id_auditoria: int
    fecha_cambio: datetime

    class Config:
        orm_mode = True


class AuditoriaList(BaseModel):
    auditorias: List[AuditoriaRead] = Field(default_factory=list)
