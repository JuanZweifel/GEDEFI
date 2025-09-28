from datetime import date
from pydantic import BaseModel, Field
from typing import Optional, List


class SerieBase(BaseModel):
    nombre_serie: str


class SerieCreate(SerieBase):
    pass


class SerieUpdate(SerieBase):
    nombre_serie: Optional[str] = None


class SerieRead(SerieBase):
    id_serie: int

    class Config:
        from_attributes = True


'''class SerieWithPlayers(SerieRead):
    jugadores: List[FichaJugadorRead] = []  # Assuming JugadorRead is defined elsewhere

    class Config:
        from_attributes = True'''

class SerieList(BaseModel):
    series: List[SerieRead] = Field(default_factory=list)


