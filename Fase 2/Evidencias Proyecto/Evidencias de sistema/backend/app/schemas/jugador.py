from datetime import date, datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from .lesion import LesionRead
from .detalle_club_jugador import DetalleClubJugadorRead
from .ficha_jugador import FichaJugadorRead
from .rendimiento_entrenamiento import RendimientoEntrenamientoRead

class JugadorBase(BaseModel):
    rut_jugador: str
    primer_nombre: str
    segundo_nombre: Optional[str] = None
    primer_apellido: str
    segundo_apellido: Optional[str] = None
    genero: bool
    fecha_nacimiento: date
    enfermedades_cronicas: Optional[str] = None
    fono_jugador: Optional[int] = None
    jugador_activo: bool

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