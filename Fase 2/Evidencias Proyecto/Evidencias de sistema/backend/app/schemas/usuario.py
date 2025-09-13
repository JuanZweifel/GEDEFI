from datetime import date
from pydantic import BaseModel, constr, Field, ConfigDict
from typing import Optional, List
from .cuenta_usuario import CuentaUsuarioRead


class UsuarioBase(BaseModel):
    rut_usu: constr(pattern=r"^\d{7,8}-[0-9Kk]$")
    primer_nombre_usu: str
    segundo_nombre_usu: Optional[str] = None
    primer_apellido_usu: str
    segundo_apellido_usu: Optional[str] = None
    fecha_nacimiento_usu: date


class UsuarioCreate(UsuarioBase):
    pass


class UsuarioRead(UsuarioBase):
    model_config = ConfigDict(from_attributes=True)


class UsuarioUpdate(BaseModel):
    primer_nombre_usu: Optional[str] = None
    segundo_nombre_usu: Optional[str] = None
    primer_apellido_usu: Optional[str] = None
    segundo_apellido_usu: Optional[str] = None
    fecha_nacimiento_usu: Optional[date] = None


class UsuarioWithCuentas(UsuarioRead):
    cuentas: List[CuentaUsuarioRead] = Field(default_factory=list)
