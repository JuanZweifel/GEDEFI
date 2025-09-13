from datetime import date
from pydantic import BaseModel



class CanchaBase(BaseModel):
    nombre_cancha: str
    direccion_cancha: str
    disponible: bool


class CanchaCreate(CanchaBase):
    pass


class CanchaRead(CanchaBase):
    id_cancha: int

    class Config:
        from_atributes = True


class CanchaUpdate(CanchaBase):
    pass