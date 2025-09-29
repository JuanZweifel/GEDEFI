from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List


class PermisoBase(BaseModel):
    nombre_permiso: str
    descripcion_permiso: Optional[str] = None


class PermisoCreate(PermisoBase):
    pass


class PermisoUpdate(BaseModel):
    nombre_permiso: Optional[str] = None
    descripcion_permiso: Optional[str] = None


class PermisoRead(PermisoBase):
    id_permiso: int
    fecha_creacion: datetime
    fecha_modificacion: datetime

    class Config:
        orm_mode = True


class PermisoList(BaseModel):
    permisos: List[PermisoRead] = Field(default_factory=list)
