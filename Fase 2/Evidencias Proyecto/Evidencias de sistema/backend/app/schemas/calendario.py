from datetime import date
from pydantic import BaseModel


class CalendarioBase(BaseModel):
    fecha_evento: date
    serie_visitante: int
    serie_local: int


class CalendarioCreate(CalendarioBase):
    pass


class CalendarioRead(CalendarioBase):
    fecha_evento: date

    class Config:
        from_atributtes = True


class CalendarioUpdate(CalendarioBase):
    pass        
