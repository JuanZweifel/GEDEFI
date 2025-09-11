from datetime import date
from pydantic import BaseModel
from typing import Optional, List
from .contrato_club import ContratoClubRead

class AsociacionBase(BaseModel):
    nombre_asociacion: str

class AsociacionCreate(AsociacionBase):
    pass

class AsociacionRead(AsociacionBase):
    id_asociacion: int

    class Config:
        from_attributes = True

class AsociacionUpdate(BaseModel):
    nombre_asociacion: Optional[str] = None

class AsociacionWithContratos(AsociacionRead):
    contratos_club: List[ContratoClubRead] = []