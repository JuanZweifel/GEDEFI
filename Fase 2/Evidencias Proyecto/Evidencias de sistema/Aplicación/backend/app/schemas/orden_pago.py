from datetime import datetime, date
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional
from ..utils.validaciones import validar_fecha, validar_rut


class OrdenPagoBase(BaseModel):
    tipo_orden: str = Field(..., max_length=25, description="Tipo de orden de pago")
    tipo_movimiento: str = Field(..., max_length=25, description="Tipo de movimiento [Ingreso, Egreso]")
    monto: float = Field(..., gt=0, description="Monto de la orden de pago")
    descripcion: Optional[str] = Field(None, max_length=500, description="Descripción de la orden de pago.")
    fecha_vencimiento: Optional[date] = Field(None, description="Fecha de vencimiento de la orden de pago.")
    id_club: Optional[int] = Field(None, description="ID del club asociado a la orden de pago.")

    @field_validator("fecha_vencimiento")
    @classmethod
    def validar_fecha_vencimiento(cls, v):
        class_name = cls.__name__
        if v is not None:
            if "Create" in class_name or "Update" in class_name:
                return validar_fecha(v, False)
        return v
    
    #@field_validator("fecha_pago")
    #@classmethod
    #def validar_fecha_pago(cls, v):
    #    class_name = cls.__name__
    #    if v is not None:
    #        if "Create" in class_name or "Update" in class_name:
    #            return validar_fecha(v, True)
    #    return v
    
    #@field_validator("usuario_pago")
    #@classmethod
    #def validar_rut_pago(cls, v):
    #    if v is not None:
    #        return validar_rut(v)
    #    return v


class OrdenPagoCreate(OrdenPagoBase):
    pass


class OrdenPagoRead(OrdenPagoBase):
    id_orden_pago: str
    tipo_pago: Optional[str] = None
    orden_paga: bool
    metodo_pago: Optional[int] = None
    numero_transaccion: Optional[str] = None
    orden_activa: bool
    fecha_pago: Optional[date] = None
    nombre_club: Optional[str] = None
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
    usuario_pago: Optional[str] = Field(None, max_length=10)

class OrdenPagoList(BaseModel):
    ordenes_pago: list[OrdenPagoRead]


class IngresosMes(BaseModel):
    total_ingresos: str      # ejemplo: "2.245.000"
    variacion: str           # ejemplo: "+12% vs mes anterior"

class EgresosMes(BaseModel):
    total_egresos: str
    variacion: str