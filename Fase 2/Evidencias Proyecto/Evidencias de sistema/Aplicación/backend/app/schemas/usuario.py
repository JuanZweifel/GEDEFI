from datetime import date, datetime
from pydantic import BaseModel, Field, EmailStr, field_validator, ConfigDict
from typing import Optional, List
from app.utils.validaciones import (
    validar_rut,
    validar_nombre,
    validar_fecha,
)


class UsuarioBase(BaseModel):
    rut_usuario: str = Field(
        ..., max_length=10, description="RUT del usuario, ej: 12345678-9"
    )
    email_usuario: EmailStr = Field(..., description="Correo electrónico del usuario")
    nombre_usuario: str = Field(
        ..., max_length=50, description="Nombre del usuario, Máximo 50 caracteres"
    )
    apellido_usuario: str = Field(
        ..., max_length=50, description="Apellido del usuario"
    )
    fecha_nacimiento: date = Field(..., description="Fecha de nacimiento del usuario")
    huella_pulgar: Optional[str] = Field(None, description="Huella digital del pulgar")
    huella_indice: Optional[str] = Field(None, description="Huella digital del índice")
    usuario_activo: bool = Field(default=True, description="Estado activo del usuario")
    admin: Optional[bool] = Field(None, description="Indica si el usuario es de asociación o no")
    id_rol: int = Field(..., ge=1, description="ID del rol asociado")

    @field_validator("rut_usuario")
    @classmethod
    def validar_rut_usuario(cls, v):
        return validar_rut(v)

    @field_validator("nombre_usuario", "apellido_usuario", mode="before")
    @classmethod
    def validar_nombre_usuario(cls, v):
        return validar_nombre(v)

    @field_validator("fecha_nacimiento")
    @classmethod
    def validar_fecha_usuario(cls, v):
        return validar_fecha(v, menor=True)


class UsuarioCreate(UsuarioBase):
    id_club: Optional[int] = Field(
        0, ge=0, description="ID del club asociado si no es admin"
    )
    pass_usuario: str = Field(..., min_length=8, description="Contraseña del usuario")


class UsuarioUpdate(BaseModel):
    email_usuario: Optional[EmailStr] = None
    nombre_usuario: Optional[str] = Field(None, max_length=50)
    apellido_usuario: Optional[str] = Field(None, max_length=50)
    fecha_nacimiento: Optional[date] = None
    huella_pulgar: Optional[str] = None
    huella_indice: Optional[str] = None
    usuario_activo: Optional[bool] = None
    id_rol: Optional[int] = Field(None, ge=1)
    pass_usuario: Optional[str] = Field(None, min_length=8)
    id_club: Optional[int] = Field(None, ge=1)


class UsuarioRead(UsuarioBase):
    fecha_creacion: datetime
    fecha_modificacion: datetime
    id_club: Optional[int] = None

    class Config:
        orm_mode = True


class UsuarioList(BaseModel):
    usuarios: List[UsuarioRead] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


# Creado por luis
class UsuarioForClub(BaseModel):
    rut_usuario: str
    email_usuario: EmailStr
    nombre_usuario: str
    apellido_usuario: str
    fecha_nacimiento: date
    id_rol: int
    nombre_rol: str

    class Config:
        from_attributes = True

