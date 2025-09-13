from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from .club import ClubRead


class OrdenPagoBase(BaseModel):
    fecha_emision: datetime
    monto_orden: int
    descripcion_orden: str
    fecha_vencimiento: datetime
    id_club: int


class OrdenPagoCreate(OrdenPagoBase):
    pass


class OrdenPagoRead(OrdenPagoBase):
    id_orden: int
    model_config = ConfigDict(from_attributes=True)


class OrdenPagoReadWithClub(OrdenPagoRead):
    club: ClubRead
