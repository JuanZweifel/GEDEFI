from datetime import date
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional


class AsistenciaReunionBase(BaseModel):
    id_reunion: int
    correo_usu: str
    asiste: bool


class AsistenciaReunionCreate(AsistenciaReunionBase):
    pass


class AsistenciaReunionRead(AsistenciaReunionBase):
    model_config = ConfigDict(from_attributes=True)


class AsistenciaReunionUpdate(BaseModel):
    asiste: Optional[bool] = None
