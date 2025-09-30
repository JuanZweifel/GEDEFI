from datetime import date, datetime
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from app.utils.validaciones import validar_fecha


class EntrenamientoBase(BaseModel):
    fecha_entrenamiento: date = Field(..., description="Fecha del entrenamiento")
    descripcion_entrenamiento: Optional[str] = Field(
        None, max_length=500, description="Descripción del entrenamiento"
    )
    activo: bool = Field(default=True, description="Estado activo del entrenamiento")

    # Validators
    @field_validator("fecha_entrenamiento")
    @classmethod
    def validar_fecha_entrenamiento(cls, v: date) -> date:
        return validar_fecha(v)


class EntrenamientoCreate(EntrenamientoBase):
    pass


class EntrenamientoUpdate(BaseModel):
    fecha_entrenamiento: Optional[date] = None
    descripcion_entrenamiento: Optional[str] = Field(None, max_length=500)
    activo: Optional[bool] = None


class EntrenamientoRead(EntrenamientoBase):
    id_entrenamiento: int
    fecha_creacion: datetime
    fecha_modificacion: datetime

    class Config:
        orm_mode = True


class EntrenamientoList(BaseModel):
    entrenamientos: List[EntrenamientoRead] = Field(default_factory=list)
