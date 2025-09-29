from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import date


class PartidoBase(BaseModel):
    fecha_partido: date
    goles_local: Optional[int] = None
    goles_visita: Optional[int] = None
    partido_activo: bool
    id_cancha: int
    serie_local: int
    serie_visita: int

class PartidoCreate(PartidoBase):
    pass

class PartidoRead(PartidoBase):
    id_partido: int
    model_config = ConfigDict(from_attributes=True)

class PartidoUpdate(BaseModel):
    fecha_partido: Optional[date] = None
    goles_local: Optional[int] = None
    goles_visita: Optional[int] = None
    partido_activo: Optional[bool] = None
    id_cancha: Optional[int] = None
    serie_local: Optional[int] = None
    serie_visita: Optional[int] = None
