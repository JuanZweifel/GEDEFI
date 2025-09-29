from datetime import date
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class LesionBase(BaseModel):
    nombre_lesion: str
    tipo_lesion: bool
    descripcion: str
    tiempo_recuperacion: Optional[int] = None
    fecha_lesion: Optional[date] = None
    fecha_fin_lesion: Optional[date] = None

class LesionCreate(LesionBase):
    rut_jugador: str

class LesionRead(LesionBase):
    id_lesion: int
    rut_jugador: str
    fecha_creacion: Optional[date] = None
    fecha_modificacion: Optional[date] = None
    model_config = ConfigDict(from_attributes=True)

class LesionUpdate(BaseModel):
    nombre_lesion: Optional[str] = None
    tipo_lesion: Optional[bool] = None
    descripcion: Optional[str] = None
    tiempo_recuperacion: Optional[int] = None
    fecha_lesion: Optional[date] = None
    fecha_fin_lesion: Optional[date] = None