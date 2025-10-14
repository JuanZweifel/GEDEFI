from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional
from ..utils.validaciones import validar_fecha, validar_rut


class OrdenPagoBase(BaseModel):
    tipo_orden: str = Field(..., max_length=10, description="Tipo de orden de pago")
    tipo_movimiento: str = Field(..., max_length=25, description="Tipo de movimiento [Ingreso, Egreso]")
    tipo_pago: str = Field(..., max_length=25, description="Tipo de pago Ej: Transferencia, pago en linea, efectivo.")
    monto: float = Field(..., gt=0, description="Monto de la orden de pago")
    metodo_pago: Optional[int] = Field(None, description="Método de pago", ge=0, le=4)
    numero_transaccion: Optional[str] = Field(None, max_length=50, description="Número de transacción.")
    descripcion: Optional[str] = Field(None, max_length=500, description="Descripción de la orden de pago.")
    fecha_vencimiento: Optional[datetime] = Field(None, description="Fecha de vencimiento de la orden de pago.")
    fecha_pago: Optional[datetime] = Field(None, description="Fecha de pago de la orden de pago.")
    id_club: Optional[int] = Field(None, description="ID del club asociado a la orden de pago.")
    fecha_modificacion: Optional[datetime] = Field(None, description="Fecha de la última modificación.")
    usuario_emisor: str = Field(..., max_length=10, description="Rut del usuario emisor de la orden de pago.")
    usuario_pago: Optional[str] = Field(None, max_length=10, description="Rut del usuario que realizó el pago.")

    @field_validator("fecha_vencimiento")
    @classmethod
    def validar_fecha_vencimiento(cls, v):
        if v is not None:
            return validar_fecha(v, True)
        return v
    
    @field_validator("fecha_pago")
    @classmethod
    def validar_fecha_pago(cls, v):
        if v is not None:
            return validar_fecha(v, False)
        return v
    
    @field_validator("usuario_emisor", "usuario_pago")
    @classmethod
    def validar_rut_pago(cls, v):
        if v is not None:
            return validar_rut(v)
        return v


class OrdenPagoCreate(OrdenPagoBase):
    pass


class OrdenPagoRead(OrdenPagoBase):
    id_orden: int
    fecha_emision: datetime = Field(..., description="Fecha de emisión de la orden de pago.")
    fecha_modificacion: datetime = Field(..., description="Fecha de la ultima modificación de la orden de pago.")
    model_config = ConfigDict(from_attributes=True)

class OrdenPagoUpdate(BaseModel):
    tipo_orden: Optional[int] = None
    tipo_pago: Optional[int] = None
    monto: Optional[float] = Field(None, gt=0, description="Monto de la orden de pago")
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
