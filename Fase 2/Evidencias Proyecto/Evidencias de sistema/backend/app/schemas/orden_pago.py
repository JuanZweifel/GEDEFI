from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional


class OrdenPagoBase(BaseModel):
    tipo_orden: int
    tipo_pago: int
    monto: float
    metodo_pago: Optional[int] = None
    numero_transaccion: Optional[str] = Field(None, max_length=50)
    descripcion: Optional[str] = Field(None, max_length=500)
    orden_activa: bool = True
    fecha_emision: Optional[datetime] = None
    fecha_vencimiento: Optional[datetime] = None
    fecha_pago: Optional[datetime] = None
    id_club: Optional[int] = None
    fecha_modificacion: Optional[datetime] = None
    usuario_emisor: str = Field(..., max_length=10)
    usuario_pago: Optional[str] = Field(None, max_length=10)


class OrdenPagoCreate(OrdenPagoBase):
    pass


class OrdenPagoRead(OrdenPagoBase):
    id_orden: int
    model_config = ConfigDict(from_attributes=True)

class OrdenPagoUpdate(BaseModel):
    tipo_orden: Optional[int] = None
    tipo_pago: Optional[int] = None
    monto: Optional[float] = None
    metodo_pago: Optional[int] = None
    numero_transaccion: Optional[str] = Field(None, max_length=50)
    descripcion: Optional[str] = Field(None, max_length=500)
    orden_activa: Optional[bool] = None
    fecha_emision: Optional[datetime] = None
    fecha_vencimiento: Optional[datetime] = None
    fecha_pago: Optional[datetime] = None
    id_club: Optional[int] = None
    usuario_emisor: Optional[str] = Field(None, max_length=10)
    usuario_pago: Optional[str] = Field(None, max_length=10)

class OrdenPagoList(BaseModel):
    ordenes_pago: list[OrdenPagoRead]
