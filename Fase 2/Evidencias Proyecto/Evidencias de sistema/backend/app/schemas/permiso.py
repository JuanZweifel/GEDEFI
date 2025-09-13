from datetime import date
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional


class PermisoBase(BaseModel):
    nombre_permiso: str
    descripcion_permiso: str


class PermisoCreate(PermisoBase):
    pass


class PermisoRead(PermisoBase):
    id_permiso: int
    model_config = ConfigDict(from_attributes=True)


class PermisoUpdate(BaseModel):
    nombre_permiso: Optional[str] = None
    descripcion_permiso: Optional[str] = None
