from pydantic import BaseModel, Field
from typing import Optional, List
from .ficha_jugador import FichaJugadorRead

class SerieBase(BaseModel):
    nombre_serie: str = Field(..., max_length=30, description="Nombre de la serie")
    id_club: int = Field(..., description="ID del club asociado a la serie")


class SerieCreate(SerieBase):
    pass


class SerieUpdate(SerieBase):
    nombre_serie: Optional[str] = None


class SerieRead(SerieBase):
    id_serie: int
    serie_activa: bool

    class Config:
        from_attributes = True


class SerieWithPlayers(SerieRead):
    jugadores: List[FichaJugadorRead] = Field(default_factory=list)

    class Config:
        from_attributes = True

class SerieList(BaseModel):
    series: List[SerieRead] = Field(default_factory=list)


