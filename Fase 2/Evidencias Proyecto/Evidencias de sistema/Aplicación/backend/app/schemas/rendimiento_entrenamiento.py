from pydantic import BaseModel, ConfigDict
from typing import Optional
#from .entrenamiento import EntrenamientoRead  # si tienes un esquema de Entrenamiento

class RendimientoEntrenamientoBase(BaseModel):
    frecuencia_cardiaca: int
    velocidad: Optional[int] = None
    duracion_recorrido: int
    nivel_oxigeno: int

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

