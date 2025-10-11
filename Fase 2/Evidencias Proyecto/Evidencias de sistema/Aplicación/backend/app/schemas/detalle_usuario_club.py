from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List


class DetalleUsuarioClubBase(BaseModel):
    # usuario_id: int = Field(..., description="ID del usuario")
    club_id: int = Field(..., description="ID del club")


class DetalleUsuarioClubCreate(DetalleUsuarioClubBase):
    pass


class DetalleUsuarioClubUpdate(BaseModel):
    fecha_fin: Optional[datetime] = Field(
        None, description="Fecha de fin de la membresía"
    )
    fecha_ini: Optional[datetime] = Field(
        None, description="Fecha de inicio de la membresía"
    )


class DetalleUsuarioClubRead(DetalleUsuarioClubBase):
    fecha_ini: datetime = Field(..., description="Fecha de inicio de la membresía")
    fecha_fin: Optional[datetime] = Field(
        None, description="Fecha de fin de la membresía"
    )

    model_config = ConfigDict(from_attributes=True)

