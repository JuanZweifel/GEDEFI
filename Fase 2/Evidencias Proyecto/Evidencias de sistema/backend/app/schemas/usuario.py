from datetime import date, datetime
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List


class UsuarioBase(BaseModel):
    email_usuario: EmailStr
    nombre_usuario: str
    apellido_usuario: str
    fecha_nacimiento: date
    huella_pulgar: Optional[str] = None
    huella_indice: Optional[str] = None
    usuario_activo: bool = True
    id_rol: int


class UsuarioCreate(UsuarioBase):
    pass_usuario: str


class UsuarioUpdate(BaseModel):
    email_usuario: Optional[EmailStr] = None
    nombre_usuario: Optional[str] = None
    apellido_usuario: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    huella_pulgar: Optional[str] = None
    huella_indice: Optional[str] = None
    usuario_activo: Optional[bool] = None
    id_rol: Optional[int] = None
    pass_usuario: Optional[str] = None


class UsuarioRead(UsuarioBase):
    rut_usuario: str
    fecha_creacion: datetime
    fecha_modificacion: datetime

    class Config:
        orm_mode = True


class UsuarioList(BaseModel):
    usuarios: List[UsuarioRead] = Field(default_factory=list)
