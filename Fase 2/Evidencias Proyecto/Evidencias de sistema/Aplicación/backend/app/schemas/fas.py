from datetime import date, datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List


class FASBase(BaseModel):
    anio_fas: int = Field(..., ge=2000, le=2100, description="Año al que corresponde el fondo de ayuda solidaria.")
    monto_inicial: float = Field(..., gt=0, description="Monto total asignado al FAS al inicio del año.")
    monto_disponible: float = Field(..., ge=0, description="Monto disponible restante en el FAS.")
    descripcion: Optional[str] = Field(None, max_length=255, description="Descripción o notas del fondo.")
    activo: Optional[bool] = Field(True, description="Indica si el FAS está activo.")


class FASCreate(FASBase):
    pass


class FASRead(FASBase):
    id_fas: int = Field(..., description="Identificador único del FAS.")
    fecha_creacion: datetime = Field(..., description="Fecha de creación del registro del FAS.")
    fecha_modificacion: datetime = Field(..., description="Fecha de última modificación del FAS.")

    model_config = ConfigDict(from_attributes=True)


class FASUpdate(BaseModel):
    anio_fas: Optional[int] = Field(None, ge=2000, le=2100)
    monto_inicial: Optional[float] = Field(None, gt=0)
    monto_disponible: Optional[float] = Field(None, ge=0)
    descripcion: Optional[str] = Field(None, max_length=255)
    activo: Optional[bool] = Field(None, description="Indica si el FAS está activo.")


class FASList(BaseModel):
    fondos: List[FASRead] = Field(default_factory=list)