from datetime import date
from pydantic import BaseModel
from typing import Optional, List

class PaisBase(BaseModel):
    nombre_pais: str
    codigo_iso3: Optional[str] = None

class PaisCreate(PaisBase):
    pass

class PaisRead(PaisBase):
    id_pais: int

    class Config:
        orm_mode = True

class PaisUpdate(BaseModel):
    nombre_pais: Optional[str] = None
    codigo_iso3: Optional[str] = None

class PaisList():
    paises: List[PaisRead]

