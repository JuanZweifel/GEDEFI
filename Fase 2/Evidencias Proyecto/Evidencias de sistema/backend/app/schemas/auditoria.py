from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List


class AuditoriaBase(BaseModel):
    recurso: str
    id_recurso: int
    descripcion: Optional[str] = None
    accion_realizada: str
    usuario: int


class AuditoriaCreate(AuditoriaBase):
    pass


class AuditoriaUpdate(BaseModel):
    recurso: Optional[str] = None
    id_recurso: Optional[int] = None
    descripcion: Optional[str] = None
    accion_realizada: Optional[str] = None
    usuario: Optional[int] = None


class AuditoriaRead(AuditoriaBase):
    id_auditoria: int
    fecha_cambio: datetime

    class Config:
        orm_mode = True


class AuditoriaList(BaseModel):
    auditorias: List[AuditoriaRead] = Field(default_factory=list)
