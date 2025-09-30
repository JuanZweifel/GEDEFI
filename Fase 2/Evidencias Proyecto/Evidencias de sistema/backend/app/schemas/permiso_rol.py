from datetime import datetime
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from app.utils.validaciones import validar_fecha


class PermisoRolBase(BaseModel):
    id_rol: int = Field(..., ge=1, description="ID del rol asociado")
    id_permiso: int = Field(..., ge=1, description="ID del permiso asociado")


class PermisoRolCreate(PermisoRolBase):
    pass


class PermisoRolUpdate(BaseModel):
    id_rol: Optional[int] = Field(None, ge=1)
    id_permiso: Optional[int] = Field(None, ge=1)


class PermisoRolRead(PermisoRolBase):
    fecha_ini_permiso_rol: datetime = Field(
        ..., description="Fecha de inicio del permiso del rol"
    )

    class Config:
        orm_mode = True


class PermisoRolList(BaseModel):
    permisos_roles: List[PermisoRolRead] = Field(default_factory=list)
