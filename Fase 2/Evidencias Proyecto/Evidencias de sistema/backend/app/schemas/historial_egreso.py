from pydantic import BaseModel
from datetime import date


class Historial_egresoBase(BaseModel):
    fecha_egreso: date
    monto_egreso: int
    tipo_pago_egre: int
    descripcion_egreso: str



class Historial_egresoCreate(Historial_egresoBase):
    pass


class Historial_egresoRead(Historial_egresoBase):
    id_egreso: int

    class Config:
        from_atributes = True


class Historial_egresoUpdate(Historial_egresoBase):
    pass