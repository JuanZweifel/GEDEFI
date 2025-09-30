from datetime import date, datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional, List
from .lesion import LesionRead
from .detalle_club_jugador import DetalleClubJugadorRead
from .ficha_jugador import FichaJugadorRead
from .rendimiento_entrenamiento import RendimientoEntrenamientoRead
from ..utils.validaciones import validar_rut, validar_nombre, validar_fecha, validar_celular_chile

class JugadorBase(BaseModel):
    rut_jugador: str
    primer_nombre: str
    segundo_nombre: Optional[str] = None
    primer_apellido: str
    segundo_apellido: Optional[str] = None
    genero: bool
    fecha_nacimiento: date
    enfermedades_cronicas: Optional[str] = None
    fono_jugador: Optional[str] = None
    jugador_activo: bool

    # Validaciones

            # Validaciones
    @field_validator("rut_jugador")
    @classmethod
    def validar_rut_jugador(cls, v) -> str:
        return validar_rut(v)

    @field_validator("primer_nombre", "segundo_nombre", "primer_apellido", "segundo_apellido", mode="before")
    @classmethod
    def validar_nombre_jugador(cls, v) -> str:
        return validar_nombre(v)

    @field_validator("fecha_nacimiento")
    @classmethod
    def validar_fecha_nacimiento(cls, v) -> date:
        return validar_fecha(v, True)

    @field_validator("fono_jugador")
    @classmethod
    def validar_fono_jugador(cls, v) -> str:
        return validar_celular_chile(v)

class JugadorCreate(JugadorBase):
    pass

class JugadorRead(JugadorBase):
    rut_jugador: str
    fecha_creacion: datetime
    fecha_modificacion: datetime
    model_config = ConfigDict(from_attributes=True)  # Esto permite mapear desde SQLAlchemy

class JugadorUpdate(BaseModel):
    primer_nombre: Optional[str] = None
    segundo_nombre: Optional[str] = None
    primer_apellido: Optional[str] = None
    segundo_apellido: Optional[str] = None
    genero: Optional[bool] = None
    fecha_nacimiento: Optional[date] = None
    enfermedades_cronicas: Optional[str] = None
    fono_jugador: Optional[int] = None
    jugador_activo: Optional[bool] = None

class JugadorReadWithRelations(JugadorRead):
    lesiones: List[LesionRead] = Field(default_factory=list)
    detalle_club_jugador: List[DetalleClubJugadorRead] = Field(default_factory=list)
    ficha_jugador: List[FichaJugadorRead] = Field(default_factory=list)
    rendimiento_entrenamiento: List[RendimientoEntrenamientoRead] = Field(default_factory=list)