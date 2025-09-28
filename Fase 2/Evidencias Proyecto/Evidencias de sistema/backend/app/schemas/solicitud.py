from datetime import date
from pydantic import BaseModel, Field
from typing import Optional, List

class SolicitudBase(BaseModel):
    usuario_solicitud: int
    usuario_respuesta: Optional[int] = None
    categoria: int
    descripcion: Optional[str] = None
    estado: bool = False
    respuesta: Optional[str] = None

class SolicitudCreate(SolicitudBase):
    pass

class SolicitudUpdate(BaseModel):
    usuario_respuesta: Optional[int] = None
    estado: Optional[bool] = None
    respuesta: Optional[str] = None

class SolicitudRead(SolicitudBase):
    id_solicitud: int
    fecha_creacion: date
    fecha_modificacion: date

    class Config:
        orm_mode = True

class SolicitudList(BaseModel):
    solicitudes: List[SolicitudRead] = Field(default_factory=list)
