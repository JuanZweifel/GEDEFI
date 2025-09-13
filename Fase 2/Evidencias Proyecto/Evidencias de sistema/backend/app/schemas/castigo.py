from datetime import date
from pydantic import BaseModel


class CastigoBase(BaseModel):
    rut_jugador: str
    descripcion_castigo: str
    fecha_ini_castigo: date
    fecha_ter_castigo: date
    duracion_en_partidos: int

class CastigoCreate(CastigoBase):
    pass

class CastigoRead(CastigoBase):
    id_castigo: int

    class Config:
        from_atributes = True

class CastigoUpdate(CastigoBase):
    pass 