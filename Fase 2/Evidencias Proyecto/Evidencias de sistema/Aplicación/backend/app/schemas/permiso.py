from datetime import datetime
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from app.utils.validaciones import validar_nombre


class PermisoBase(BaseModel):
    nombre_permiso: str = Field(..., max_length=50, description="Nombre del permiso")
    descripcion_permiso: Optional[str] = Field(
        None, max_length=200, description="Descripción del permiso"
    )

    @field_validator("nombre_permiso", mode="before")
    @classmethod
    def validar_nombre_permiso(cls, v):
        return validar_nombre(v)


class PermisoCreate(PermisoBase):
    pass


class PermisoUpdate(BaseModel):
    nombre_permiso: Optional[str] = Field(None, max_length=50)
    descripcion_permiso: Optional[str] = Field(None, max_length=200)


class PermisoRead(PermisoBase):
    id_permiso: int
    fecha_creacion: datetime
    fecha_modificacion: datetime

    class Config:
        orm_mode = True


class PermisoList(BaseModel):
    permisos: List[PermisoRead] = Field(default_factory=list)
