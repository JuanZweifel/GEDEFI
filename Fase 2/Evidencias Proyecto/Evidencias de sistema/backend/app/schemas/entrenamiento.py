from datetime import date, datetime
from pydantic import BaseModel, Field
from typing import Optional, List


class EntrenamientoBase(BaseModel):
    fecha_entrenamiento: date
    descripcion_entrenamiento: Optional[str] = None
    activo: bool = True


class EntrenamientoCreate(EntrenamientoBase):
    pass


class EntrenamientoUpdate(BaseModel):
    fecha_entrenamiento: Optional[date] = None
    descripcion_entrenamiento: Optional[str] = None
    activo: Optional[bool] = None


class EntrenamientoRead(EntrenamientoBase):
    id_entrenamiento: int
    fecha_creacion: datetime
    fecha_modificacion: datetime

    class Config:
        orm_mode = True


class EntrenamientoList(BaseModel):
    entrenamientos: List[EntrenamientoRead] = Field(default_factory=list)
