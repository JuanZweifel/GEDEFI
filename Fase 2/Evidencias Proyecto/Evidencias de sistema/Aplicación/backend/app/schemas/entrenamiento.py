from datetime import date, datetime, time
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from app.utils.validaciones import validar_fecha


class EntrenamientoBase(BaseModel):
    fecha_entrenamiento: date = Field(..., description="Fecha del entrenamiento")
    descripcion_entrenamiento: Optional[str] = Field(
        None, max_length=500, description="Descripción del entrenamiento"
    )
    activo: bool = Field(default=True, description="Estado activo del entrenamiento")


# ✅ Clase para crear un entrenamiento (aquí sí validamos)
class EntrenamientoCreate(EntrenamientoBase):
    rut_usuario: str = Field(..., description="RUT del usuario que registra el entrenamiento")
    id_cancha: int = Field(..., description="ID de la cancha donde se realiza el entrenamiento")
    id_serie: int = Field(..., description="ID de la serie asociada al entrenamiento")
    hora_ini: time
    hora_fin: time

    # ✅ Validación de fecha solo aquí (no en lectura)
    @field_validator("fecha_entrenamiento")
    @classmethod
    def validar_fecha_entrenamiento(cls, v: date) -> date:
        return validar_fecha(v, menor=False)


class EntrenamientoUpdate(BaseModel):
    fecha_entrenamiento: Optional[date] = None
    descripcion_entrenamiento: Optional[str] = Field(None, max_length=500)
    activo: Optional[bool] = None
    id_cancha: Optional[int] = None
    id_serie: Optional[int] = None
    hora_ini: Optional[time] = None
    hora_fin: Optional[time] = None


# ✅ Clase para lectura (sin validaciones → evita el error 500)
class EntrenamientoRead(EntrenamientoBase):
    id_entrenamiento: int
    fecha_creacion: datetime
    fecha_modificacion: datetime
    rut_usuario: str
    id_cancha: int
    id_serie: int
    hora_ini: time
    hora_fin: time

    class Config:
        orm_mode = True


# ✅ Para respuestas de lista si alguna vez las necesitas
class EntrenamientoList(BaseModel):
    entrenamientos: List[EntrenamientoRead] = Field(default_factory=list)
