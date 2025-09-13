from pydantic import BaseModel
from datetime import date


class Historial_ingresoBase(BaseModel):
    fecha_ingreso: date
    monto_ingreso: int
    tipo_pago_ingre: int
    descripcion_ingreso: str



class Historial_ingresoCreate(Historial_ingresoBase):
    id_orden: int


class Historial_ingresoRead(Historial_ingresoBase):
    id_ingreso: int

    class Config:
        from_atributes = True


class Historial_ingresoUpdate(Historial_ingresoBase):
    pass