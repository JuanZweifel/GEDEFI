from datetime import date
from pydantic import BaseModel
from typing import Optional, List
from .estadistica_jugador import EstadisticaJugadorRead

# TODO: Falta relacion con pais

class FichaJugadorBase(BaseModel):
    rut_jugador: str
    primer_nombre: str
    segundo_nombre: Optional[str] = None
    primer_apellido: str
    segundo_apellido: Optional[str] = None
    enfermedades_cronicas: Optional[str] = None
    fecha_nacimiento: date
    nacionalidad: str
    correo_electronico: str
    pierna_habil: Optional[int] = None  # 1: derecha, 2: izquierda, 3: ambas
    genero: bool  # True: masculino, False: femenino


class FichaJugadorCreate(FichaJugadorBase):
    pass


class FichaJugadorRead(FichaJugadorBase):
    rut_jugador: str

    class Config:
        from_attributes = True


class FichaJugadorUpdate(BaseModel):
    primer_nombre: Optional[str] = None
    segundo_nombre: Optional[str] = None
    primer_apellido: Optional[str] = None
    segundo_apellido: Optional[str] = None
    enfermedades_cronicas: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    nacionalidad: Optional[str] = None
    correo_electronico: Optional[str] = None
    pierna_habil: Optional[int] = None  # 1: derecha, 2: izquierda, 3: ambas
    genero: Optional[bool] = None  # True: masculino, False: femenino


class FichaJugadorWithDetails(FichaJugadorRead):
    estadisticas_jugadores: List[EstadisticaJugadorRead] = []
    # evaluaciones_fisicas: List[EvaluacionFisicaRead] = []
    # lesiones: List[LesionRead] = []
