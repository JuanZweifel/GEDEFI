from sqlalchemy import ForeignKey
from sqlalchemy import String, Integer, Date, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db import Base


class DetalleReunion(Base):
    __tablename__ = "DETALLE_REUNION"

    rut_usuario: Mapped[str] = mapped_column(
        String(320), ForeignKey("USUARIO.rut_usuario"), primary_key=True
    )
    id_reunion: Mapped[int] = mapped_column(
        Integer, ForeignKey("REUNION.id_reunion"), primary_key=True
    )
    hora_llegada: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    hora_salida: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    # Relaciones
    reunion: Mapped["Reunion"] = relationship(
        "Reunion", back_populates="detalles_reunion"
    )
    usuario: Mapped["Usuario"] = relationship(
        "Usuario", back_populates="detalles_reunion"
    )
