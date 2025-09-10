from datetime import date
from pydantic import BaseModel
from typing import Optional, List

# TODO: Falta la relacion con ASISTENCIA_REUNION


class ReunionBase(BaseModel):
    tipo_reunion: int
    fecha_reunion: date
    desc_reunion: Optional[str] = None


class ReunionCreate(ReunionBase):
    pass


class ReunionRead(ReunionBase):
    id_reunion: int

    class Config:
        from_atributtes = True


class ReunionUpdate(BaseModel):
    tipo_reunion: Optional[int] = None
    fecha_reunion: Optional[date] = None
    desc_reunion: Optional[str] = None
