from enum import Enum
from sqlalchemy import String, Integer, DateTime, Boolean, Date, JSON, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import datetime, timezone, date
from app.db import Base


class SuperficieEnum(str, Enum):
    CESPED_NATURAL = "Césped Natural"
    CESPED_SINTETICO = "Césped Sintético"
    TIERRA = "Tierra"


class Cancha(Base):
    __tablename__ = "CANCHA"

    id_cancha: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre_cancha: Mapped[str] = mapped_column(String(50), nullable=False)
    superficie_cancha: Mapped[SuperficieEnum] = mapped_column(
        SQLEnum(SuperficieEnum), nullable=False
    )
    direccion: Mapped[str] = mapped_column(String(300), nullable=True)
    cancha_activa: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    ultimo_mantenimiento: Mapped[date] = mapped_column(Date, nullable=True)
    observaciones: Mapped[str] = mapped_column(String(500), nullable=True)
    instalaciones: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=[])
    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now(timezone.utc), nullable=False
    )
    fecha_modificacion: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now(timezone.utc),
        nullable=False,
        onupdate=datetime.now(timezone.utc),
    )

    # Relaciones
    partido: Mapped[list["Partido"]] = relationship("Partido", back_populates="cancha")

    entrenamientos: Mapped["Entrenamiento"] = relationship(
        "Entrenamiento", back_populates="cancha"
    )
