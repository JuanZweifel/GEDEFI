from datetime import date, datetime
from fastapi import UploadFile
from pydantic import BaseModel, Field, ConfigDict, field_validator, EmailStr
from typing import Optional, List, Union
from .orden_pago import OrdenPagoRead
from .serie import SerieRead
from ..utils.validaciones import *
from .usuario import UsuarioRead
from .serie import SerieRead
from .jugador import JugadorRead


class ClubBase(BaseModel):
    rut_club: str = Field(..., min_length=9, max_length=10, description="RUT del club.")
    nombre_club: str = Field(..., max_length=120, min_length=4, description="Nombre del club.")
    fecha_fundacion: date = Field(..., description="Fecha de fundación del club.")
    fono_club: Optional[str] = Field(None, max_length=12, description="Teléfono del club.")
    direccion_club: str = Field(..., max_length=500, min_length=10, description="Dirección del club.")
    email_club: EmailStr = Field(..., max_length=320, description="Email del club.")
    logo_club: Optional[str] = Field(None, description="Ruta del archivo del logo.")
    color_primario: str = Field(..., min_length=7, max_length=7, description="Color principal del club en formato hexadecimal (ej: #ABC123).")
    color_secundario: str = Field(..., min_length=7, max_length=7, description="Color secundario del club en formato hexadecimal (ej: #ABC123).")
    color_respaldo: Optional[str] = Field(None, description="Color respaldo del club en formato hexadecimal (ej: #ABC123).")

    @field_validator("rut_club")
    @classmethod
    def validar_rut_club(cls, v) -> str:
        return validar_rut(v)

    @field_validator("nombre_club", mode="before")
    @classmethod
    def validar_nombre_club(cls, v) -> str:
        return validar_nombre(v)
    
    def validar_fecha_fundacion(cls, v):
        if isinstance(v, str):
            # convierte el string "YYYY-MM-DD" a date
            v = date.fromisoformat(v)
        elif isinstance(v, datetime):
            # si viene un datetime, tomar solo la fecha
            v = v.date()
        return validar_fecha(v)
    
    @field_validator("fono_club")
    @classmethod
    def validar_fono_club(cls, v) -> Optional[str]:
        if v is not None:
            return validar_celular_chile(v)
        return v



class ClubCreate(ClubBase):
    pass


class ClubRead(ClubBase):
    id_club: int = Field(..., description="ID del club")
    club_activo: bool = Field(..., description="Indica si el club está activo")
    fecha_creacion: datetime = Field(..., description="Fecha de creación del club")
    fecha_modificacion: datetime = Field(..., description="Fecha de última modificación del club")

    model_config = ConfigDict(from_attributes=True)

    


class ClubUpdate(BaseModel):
    rut_club: Optional[str] = Field(None, max_length=10, min_length=9)
    nombre_club: Optional[str] = Field(None, max_length=120, min_length=4, description="Nombre del club")
    fecha_fundacion: Optional[date] = Field(None, description="Fecha de fundación del club")
    fono_club: Optional[str] = Field(None, max_length=12, description="Teléfono del club")
    direccion_club: Optional[str] = Field(None, max_length=500, min_length=10, description="Dirección del club")
    email_club: Optional[str] = Field(None, max_length=320, description="Email del club")
    logo_club: Optional[str] = Field(None, description="Ruta del archivo del logo.")
    color_primario: str = Field(..., min_length=7, max_length=7, description="Color principal del club en formato hexadecimal (ej: #ABC123).")
    color_secundario: str = Field(..., min_length=7, max_length=7, description="Color secundario del club en formato hexadecimal (ej: #ABC123).")
    color_respaldo: Optional[str] = Field(None, description="Color respaldo del club en formato hexadecimal (ej: #ABC123).")
    club_activo: Optional[bool] = Field(None, description="Club activo")

    @field_validator("rut_club")
    @classmethod
    def validar_rut_club(cls, v) -> str:
        return validar_rut(v)

    @field_validator("nombre_club", mode="before")
    @classmethod
    def validar_nombre_club(cls, v) -> str:
        return validar_nombre(v)
    
    def validar_fecha_fundacion(cls, v):
        if isinstance(v, str):
            # convierte el string "YYYY-MM-DD" a date
            v = date.fromisoformat(v)
        elif isinstance(v, datetime):
            # si viene un datetime, tomar solo la fecha
            v = v.date()
        return validar_fecha(v)
    
    @field_validator("fono_club")
    @classmethod
    def validar_fono_club(cls, v) -> Optional[str]:
        if v is not None:
            return validar_celular_chile(v)
        return v


class ClubWithOrdenPago(ClubRead):
    ordenes_pago: List[OrdenPagoRead] = Field(default_factory=list)

class ClubList(BaseModel):
    clubs: List[ClubRead] = Field(default_factory=list)

class ClubWithDetails(ClubRead):
    directiva: List[UsuarioRead] = Field(default_factory=list)
    series: int
    jugadores: int

