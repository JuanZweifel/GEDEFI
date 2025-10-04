from datetime import date, datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator, EmailStr
from typing import Optional, List
from .orden_pago import OrdenPagoRead
from .serie import SerieRead
from ..utils.validaciones import *
from .usuario import UsuarioRead
from .serie import SerieRead
from .jugador import JugadorRead


class ClubBase(BaseModel):
    nombre_club: str = Field(..., max_length=120, min_length=4, description="Nombre del club")
    fecha_fundacion: date = Field(..., description="Fecha de fundación del club")
    fono_club: Optional[str] = Field(None, max_length=12, description="Teléfono del club")
    direccion_club: str = Field(..., max_length=500, min_length=10, description="Dirección del club")
    email_club: EmailStr = Field(..., max_length=320, description="Email del club")

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
    nombre_club: Optional[str] = Field(None, max_length=120, min_length=4, description="Nombre del club")
    fecha_fundacion: Optional[date] = Field(None, description="Fecha de fundación del club")
    fono_club: Optional[str] = Field(None, max_length=12, description="Teléfono del club")
    direccion_club: Optional[str] = Field(None, max_length=500, min_length=10, description="Dirección del club")
    email_club: Optional[str] = Field(None, max_length=320, description="Email del club")
    club_activo: Optional[bool] = Field(None, description="Club activo")


class ClubWithOrdenPago(ClubRead):
    ordenes_pago: List[OrdenPagoRead] = Field(default_factory=list)

class ClubList(BaseModel):
    clubs: List[ClubRead] = Field(default_factory=list)

class ClubWithSeries(ClubRead):
    series: List[SerieRead] = Field(default_factory=list)

class ClubWithDetails(ClubRead):
    directiva: List[UsuarioRead] = Field(default_factory=list)
    series: int
    jugadores: int

