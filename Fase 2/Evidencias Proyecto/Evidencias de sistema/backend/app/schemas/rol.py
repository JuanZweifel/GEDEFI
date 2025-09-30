from datetime import datetime
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from app.utils.validaciones import validar_nombre


class RolBase(BaseModel):
    nombre_rol: str = Field(
        ..., max_length=50, description="Nombre del rol, máximo 50 caracteres"
    )
    desc_rol: Optional[str] = Field(
        None, max_length=200, description="Descripción del rol, máximo 200 caracteres"
    )
    rol_activo: bool = Field(default=True, description="Estado activo del rol")

    @field_validator("nombre_rol", mode="before")
    @classmethod
    def validar_nombre_rol(cls, v):
        return validar_nombre(v)


class RolCreate(RolBase):
    pass


class RolUpdate(BaseModel):
    nombre_rol: Optional[str] = Field(None, max_length=50)
    desc_rol: Optional[str] = Field(None, max_length=200)
    rol_activo: Optional[bool] = None


class RolRead(RolBase):
    id_rol: int
    fecha_creacion: datetime
    fecha_modificacion: datetime

    class Config:
        orm_mode = True


class RolList(BaseModel):
    roles: List[RolRead] = Field(default_factory=list)
