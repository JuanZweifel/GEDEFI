from datetime import date
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from .orden_pago import OrdenPagoRead


class ClubBase(BaseModel):
    nombre_club: str
    fecha_fundacion: date
    fono_club: Optional[str] = None
    direccion_club: str
    email_club: str


class ClubCreate(ClubBase):
    pass


class ClubRead(ClubBase):
    id_club: int
    model_config = ConfigDict(from_attributes=True)


class ClubUpdate(BaseModel):
    nombre_club: Optional[str] = None
    fecha_fundacion: Optional[date] = None
    mensualidad_activa: Optional[bool] = None


class ClubWithOrdenPago(ClubRead):
    ordenes_pago: List[OrdenPagoRead] = Field(default_factory=list)

class ClubList(BaseModel):
    clubs: List[ClubRead] = Field(default_factory=list)


