from datetime import date
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from .contrato_club import ContratoClubRead
from .orden_pago import OrdenPagoRead


class ClubBase(BaseModel):
    nombre_club: str
    fecha_fundacion: date
    mensualidad_activa: bool


class ClubCreate(ClubBase):
    pass


class ClubRead(ClubBase):
    id_club: int
    model_config = ConfigDict(from_attributes=True)


class ClubUpdate(BaseModel):
    nombre_club: Optional[str] = None
    fecha_fundacion: Optional[date] = None
    mensualidad_activa: Optional[bool] = None


class ClubWithContratos(ClubRead):
    contratos: List[ContratoClubRead] = Field(default_factory=list)


class ClubWithOrdenPago(ClubRead):
    ordenes_pago: List[OrdenPagoRead] = Field(default_factory=list)
