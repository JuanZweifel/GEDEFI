from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List


class AuditoriaBase(BaseModel):
    recurso: str = Field(..., max_length=50, description="Nombre del recurso afectado")
    id_recurso: Optional[str] = Field(None, description="ID del recurso afectado")
    descripcion: Optional[str] = Field(
        None, max_length=500, description="Descripción de la auditoría"
    )
    accion_realizada: str = Field(
        ..., max_length=100, description="Acción realizada sobre el recurso"
    )
    error: bool = Field(
        False, description="Indica si la acción resultó en un error"
    )
    rut_usuario: str = Field(..., min_length=9, max_length=10, description="ID del usuario que realizó la acción")


class AuditoriaCreate(AuditoriaBase):
    pass


class AuditoriaUpdate(BaseModel):
    recurso: Optional[str] = Field(None, max_length=50)
    id_recurso: Optional[str] = Field(None, ge=1)
    descripcion: Optional[str] = Field(None, max_length=500)
    accion_realizada: Optional[str] = Field(None, max_length=100)
    rut_usuario: Optional[str] = Field(None, min_length=9, max_length=10)


class AuditoriaRead(AuditoriaBase):
    id_auditoria: int
    fecha_cambio: datetime
    rut_usuario: str
    nombre_usuario: str
    apellido_usuario: str

    model_config = ConfigDict(from_attributes=True)


class AuditoriaList(BaseModel):
    auditorias: List[AuditoriaRead] = Field(default_factory=list)

class ResumenAuditoria(BaseModel):
    acciones_hoy: int
    exitos_hoy: int
    errores_hoy: int
    modulos_auditados: int
