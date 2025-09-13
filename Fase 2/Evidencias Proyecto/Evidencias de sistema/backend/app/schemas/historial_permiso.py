from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional


class HistorialPermisoBase(BaseModel):
    correo_usu: str
    id_permiso: int
    fecha_ini_permiso: datetime
    fecha_fin_permiso: Optional[datetime] = None


class HistorialPermisoCreate(HistorialPermisoBase):
    pass


class HistorialPermisoRead(HistorialPermisoBase):
    model_config = ConfigDict(from_attributes=True)


class HistorialPermisoUpdate(BaseModel):
    fecha_fin_permiso: Optional[datetime] = None
