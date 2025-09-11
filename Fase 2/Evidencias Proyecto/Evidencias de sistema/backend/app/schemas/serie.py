from datetime import date
from pydantic import BaseModel
from typing import Optional, List
from .ficha_jugador import FichaJugadorRead


class SerieBase(BaseModel):
    nombre_serie: str
    id_club: int
    id_asociacion: int


class SerieCreate(SerieBase):
    pass


class SerieUpdate(SerieBase):
    nombre_serie: Optional[str] = None


class SerieRead(SerieBase):
    id_serie: int

    class Config:
        from_attributes = True


class SerieWithPlayers(SerieRead):
    jugadores: List[FichaJugadorRead] = []  # Assuming JugadorRead is defined elsewhere

    class Config:
        from_attributes = True
