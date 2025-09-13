from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict, SecretStr
from typing import Optional, List
from .asistencia_reunion import AsistenciaReunionRead


class CuentaUsuarioBase(BaseModel):
    correo_usu: EmailStr
    contrasena_usu: SecretStr
    rol_usu: str
    rut_usu: str
    id_club: int


class CuentaUsuarioCreate(CuentaUsuarioBase):
    pass


class CuentaUsuarioRead(CuentaUsuarioBase):
    model_config = ConfigDict(from_attributes=True)


class CuentaUsuarioUpdate(BaseModel):
    contrasena_usu: Optional[SecretStr] = None
    huella_indice_usu: Optional[str] = None
    huella_pulgar_usu: Optional[str] = None
    rol_usu: Optional[str] = None
    id_club: Optional[int] = None


class CuentaUsuarioWithFingerprint(CuentaUsuarioRead):
    huella_indice_usu: Optional[str] = None
    huella_pulgar_usu: Optional[str] = None


class CuentaUsuarioWithPermissions(CuentaUsuarioRead):
    permisos: List[str] = Field(default_factory=list)


class CuentaUsuarioWithAsistencias(CuentaUsuarioRead):
    asistencias: List[AsistenciaReunionRead] = Field(default_factory=list)
