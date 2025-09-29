from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List


class PermisoRolBase(BaseModel):
    fecha_fin_permiso_rol: Optional[datetime] = None
    id_rol: int
    id_permiso: int


class PermisoRolCreate(PermisoRolBase):
    pass


class PermisoRolUpdate(BaseModel):
    fecha_fin_permiso_rol: Optional[datetime] = None
    id_rol: Optional[int] = None
    id_permiso: Optional[int] = None


class PermisoRolRead(PermisoRolBase):
    fecha_ini_permiso_rol: datetime

    class Config:
        orm_mode = True


class PermisoRolList(BaseModel):
    permisos_roles: List[PermisoRolRead] = Field(default_factory=list)
