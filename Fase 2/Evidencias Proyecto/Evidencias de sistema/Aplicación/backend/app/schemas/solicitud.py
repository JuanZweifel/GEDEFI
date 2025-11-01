from datetime import datetime
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from ..utils.validaciones import validar_rut


class SolicitudBase(BaseModel):
    usuario_solicitud: str = Field(
        ..., description="Rut del usuario que realiza la solicitud"
    )
    usuario_respuesta: Optional[str] = Field(
        None, description="Rut del usuario que responde la solicitud"
    )
    categoria: int = Field(..., ge=0, le=4, description="Categoría de la solicitud")
    descripcion: Optional[str] = Field(
        None, max_length=500, description="Descripción de la solicitud"
    )
    estado: bool = Field(
        False, description="Estado de la solicitud, True si está resuelta"
    )
    respuesta: Optional[str] = Field(
        None, max_length=500, description="Respuesta a la solicitud"
    )

    @field_validator("usuario_solicitud", "usuario_respuesta")
    @classmethod
    def validar_rut_solicitud(cls, v):
        if v is not None:
            return validar_rut(v)
        return v


class SolicitudCreate(SolicitudBase):
    pass


class SolicitudUpdate(BaseModel):
    usuario_respuesta: Optional[str] = None
    estado: Optional[bool] = None
    respuesta: Optional[str] = None


class SolicitudRead(SolicitudBase):
    id_solicitud: int
    fecha_creacion: datetime
    fecha_modificacion: datetime

    class Config:
        orm_mode = True


class SolicitudWithUserClub(BaseModel):
    id_solicitud: int
    categoria: int
    descripcion: str
    estado: bool
    respuesta: str | None
    fecha_creacion: datetime
    nombre_usuario: str
    apellido_usuario: str
    nombre_club: str | None


class SolicitudList(BaseModel):
    solicitudes: List[SolicitudRead] = Field(default_factory=list)


class SolicitudResponseUpdate(BaseModel):
    respuesta: str = Field(..., max_length=500, description="Respuesta a la solicitud")
    estado: bool = Field(
        ..., description="Estado de la solicitud, True si está resuelta"
    )
