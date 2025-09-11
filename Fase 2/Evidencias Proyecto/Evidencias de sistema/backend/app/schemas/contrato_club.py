from datetime import date
from pydantic import BaseModel
from typing import Optional, List
from .serie import SerieRead

class ContratoClubBase(BaseModel):
    id_asociacion: int
    #id_club: int
    fecha_contrato: date

class AsociacionCreate(ContratoClubBase):
    pass

class ContratoClubRead(ContratoClubBase):
    id_asociacion:int
    id_club: int

    class Config:
        from_attributes = True

class ContratoClubUpdate(BaseModel):
    id_asociacion: Optional[int] = None
    #id_club: Optional[int] = None
    fecha_contrato: Optional[date] = None

class ContratoClubWithSeries(ContratoClubRead):
    series: List[SerieRead] = []

# TODO: FALTA RELACION CON CLUB


