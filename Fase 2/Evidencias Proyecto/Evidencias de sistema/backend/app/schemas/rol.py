from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List


class RolBase(BaseModel):
    nombre_rol: str
    desc_rol: Optional[str] = None
    rol_activo: bool = True


class RolCreate(RolBase):
    pass


class RolUpdate(BaseModel):
    nombre_rol: Optional[str] = None
    desc_rol: Optional[str] = None
    rol_activo: Optional[bool] = None


class RolRead(RolBase):
    id_rol: int
    fecha_creacion: datetime
    fecha_modificacion: datetime

    class Config:
        orm_mode = True


class RolList(BaseModel):
    roles: List[RolRead] = Field(default_factory=list)
