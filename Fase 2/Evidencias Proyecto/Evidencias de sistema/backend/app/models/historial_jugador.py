from sqlalchemy import String, Integer, Date, Boolean, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date, datetime, timezone
from app.db import Base

class Jugador(Base):
    __tablename__ = "JUGADOR"

    rut_jugador: Mapped[str] = mapped_column(String(10), primary_key=True, index=True)
    primer_nombre: Mapped[str] = mapped_column (String(30), nullable=False)
    segundo_nombre: Mapped[str] = mapped_column(String(30), nullable=True)
    primer_apellido: Mapped[str] = mapped_column(String(30), nullable=False)
    segundo_apellido: Mapped[str] = mapped_column(String(30), nullable=True)
    genero: Mapped[bool] = mapped_column(Boolean, nullable=False)
    fecha_nacimiento: Mapped[date] = mapped_column(Date, nullable=False)
    enfermedades_cronicas: Mapped[str] = mapped_column(String(500), nullable=True)
    fono_jugador: Mapped[int] = mapped_column(Integer, nullable=True)
    jugador_activo:Mapped[bool] = mapped_column(Boolean, nullable=False)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc), nullable=False)
    fecha_modificacion: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc), nullable=False, onupdate=datetime.now(timezone.utc))
    #modificado_por:Mapped[str] = mapped_column(String, ForeignKey("USUARIO.rut_usuario"), nullable=False)
    fecha_creacion_hist:Mapped[date] = mapped_column(Date, nullable=False)