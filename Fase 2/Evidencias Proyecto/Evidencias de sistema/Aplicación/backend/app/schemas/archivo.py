from datetime import datetime
from pydantic import BaseModel, Field, field_validator, EmailStr
from typing import Optional, List
from app.utils.validaciones import validar_nombre
import re


class ArchivoBase(BaseModel):
    nombre_archivo: str = Field(
        ..., max_length=100, description="Nombre del archivo, máximo 100 caracteres"
    )
    estado_archivo: bool = Field(default=True, description="Estado del archivo")
    ruta_archivo: str = Field(
        ..., max_length=255, description="Ruta del archivo en el sistema"
    )
    tamano_archivo: int = Field(..., ge=0, description="Tamaño del archivo en bytes")
    tipo_archivo: str = Field(..., max_length=50, description="Tipo/MIME del archivo")
    id_usuario: int = Field(..., ge=1, description="ID del usuario que cargo archivo")

    @field_validator("nombre_archivo", mode="before")
    @classmethod
    def validar_nombre(cls, v):
        return validar_nombre(v)

    @field_validator("ruta_archivo", mode="before")
    @classmethod
    def validar_ruta(cls, v):
        if not v or not v.strip():
            raise ValueError("La ruta del archivo no puede estar vacía")
        pattern = r"^[\w\-/\\:.]+$"
        if not re.fullmatch(pattern, v.strip()):
            raise ValueError("La ruta del archivo contiene caracteres inválidos")
        return v.strip()

    @field_validator("tipo_archivo", mode="before")
    @classmethod
    def validar_tipo(cls, v):
        if not v or not v.strip():
            raise ValueError("El tipo del archivo no puede estar vacío")
        pattern = r"^[\w\-/]+$"
        if not re.fullmatch(pattern, v.strip()):
            raise ValueError("El tipo del archivo no es válido")
        return v.strip()


class ArchivoCreate(ArchivoBase):
    pass


class ArchivoUpdate(BaseModel):
    nombre_archivo: Optional[str] = Field(None, max_length=100)
    estado_archivo: Optional[bool] = None
    ruta_archivo: Optional[str] = Field(None, max_length=255)
    tamano_archivo: Optional[int] = Field(None, ge=0)
    tipo_archivo: Optional[str] = Field(None, max_length=50)
    id_usuario: Optional[int] = Field(None, ge=1)


class ArchivoRead(ArchivoBase):
    id_archivo: int
    fecha_carga_archivo: datetime

    class Config:
        orm_mode = True


class ArchivoList(BaseModel):
    archivos: List[ArchivoRead] = Field(default_factory=list)
