from sqlalchemy import ForeignKey
from sqlalchemy import String, Integer, Date, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import date
from app.db import Base


class DetalleReunion(Base):
    __tablename__ = "DETALLE_REUNION"

    asistencia: Mapped[bool] = mapped_column(Boolean, default=False)

    # Claves foraneas
    correo_usu: Mapped[str] = mapped_column(
        String(320), ForeignKey("CUENTA_USUARIO.correo_usu"), primary_key=True
    )
    id_reunion: Mapped[int] = mapped_column(
        Integer, ForeignKey("REUNION.id_reunion"), primary_key=True
    )
    hora_llegada: Mapped[date] = mapped_column(Date, nullable=True)
    hora_salida: Mapped[date] = mapped_column(Date, nullable=True)

    # Relaciones
    reunion: Mapped["Reunion"] = relationship("Reunion", back_populates="asistencias")
    cuenta_usuario: Mapped["CuentaUsuario"] = relationship(
        "CuentaUsuario", back_populates="asistencias"
    )
