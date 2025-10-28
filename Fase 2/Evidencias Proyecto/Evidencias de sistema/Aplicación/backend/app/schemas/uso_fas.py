from datetime import date, datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from .jugador import JugadorBase
from .fas import FASRead

# -------------------------------------------------------
# 🧱 UsoFAS Base
# -------------------------------------------------------
class UsoFASBase(BaseModel):
    id_fas: int = Field(..., description="Identificador del FAS al que pertenece el uso.")
    rut_jugador: str = Field(..., min_length=9, max_length=10, description="RUT del jugador beneficiado.")
    descripcion_gasto: Optional[str] = Field(None, max_length=500, description="Descripción del gasto médico o ayuda otorgada.")
    monto_usado: float = Field(..., gt=0, description="Monto utilizado por el jugador del fondo.")
    fecha_uso: date = Field(..., description="Fecha en que se realizó el uso del fondo.")
    aprobado: Optional[bool] = Field(False, description="Indica si la ayuda fue aprobada por la administración.")


class UsoFASCreate(UsoFASBase):
    pass


class UsoFASRead(UsoFASBase):
    id_uso_fas: int = Field(..., description="Identificador único del uso de FAS.")
    fecha_creacion: datetime = Field(..., description="Fecha de creación del registro de uso del fondo.")
    fecha_modificacion: datetime = Field(..., description="Fecha de última modificación del registro.")
    
    model_config = ConfigDict(from_attributes=True)


class UsoFASUpdate(BaseModel):
    descripcion_gasto: Optional[str] = Field(None, max_length=500)
    monto_usado: Optional[float] = Field(None, gt=0)
    fecha_uso: Optional[date] = Field(None)
    aprobado: Optional[bool] = Field(None)
    id_fas: Optional[int] = Field(None)
    rut_jugador: Optional[str] = Field(None, min_length=9, max_length=10)


class UsoFASWithDetails(UsoFASRead):
    jugador: Optional[JugadorBase] = Field(None, description="Información del jugador que usó el fondo.")
    fas: Optional[FASRead] = Field(None, description="Información del fondo de ayuda solidaria asociado.")

class UsoFASList(BaseModel):
    usos: List[UsoFASRead] = Field(default_factory=list)