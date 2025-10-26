from pydantic import BaseModel, ConfigDict
from typing import Optional

class RendimientoEntrenamientoBase(BaseModel):
    frecuencia_cardiaca: Optional [int] = None
    velocidad: Optional[int] = None 
    duracion_recorrido: Optional [int] = None
    nivel_oxigeno: Optional [int] = None
    observaciones: Optional [str] = None
    asistencia: bool

class RendimientoEntrenamientoCreate(RendimientoEntrenamientoBase):
    rut_jugador: str
    id_entrenamiento: int

class RendimientoEntrenamientoRead(RendimientoEntrenamientoBase):
    rut_jugador: str
    id_entrenamiento: int
    model_config = ConfigDict(from_attributes=True)

class RendimientoEntrenamientoUpdate(BaseModel):
    frecuencia_cardiaca: Optional[int] = None
    velocidad: Optional[int] = None
    duracion_recorrido: Optional[int] = None
    nivel_oxigeno: Optional[int] = None
    observaciones: Optional [str] = None

