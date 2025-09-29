from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List


class ArchivoBase(BaseModel):
    nombre_archivo: str
    estado_archivo: bool = True
    ruta_archivo: str
    tamano_archivo: int
    tipo_archivo: str
    id_usuario: int


class ArchivoCreate(ArchivoBase):
    pass


class ArchivoUpdate(BaseModel):
    nombre_archivo: Optional[str] = None
    estado_archivo: Optional[bool] = None
    ruta_archivo: Optional[str] = None
    tamano_archivo: Optional[int] = None
    tipo_archivo: Optional[str] = None
    id_usuario: Optional[int] = None


class ArchivoRead(ArchivoBase):
    id_archivo: int
    fecha_carga_archivo: datetime

    class Config:
        orm_mode = True


class ArchivoList(BaseModel):
    archivos: List[ArchivoRead] = Field(default_factory=list)
