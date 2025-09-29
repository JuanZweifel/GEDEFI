from sqlalchemy import ForeignKey
from sqlalchemy import String, Integer, Date, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import datetime, date, timezone
from app.db import Base


class Entrenamiento(Base):
    __tablename__ = "ENTRENAMIENTO"

    id_entrenamiento: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    fecha_entrenamiento: Mapped[date] = mapped_column(Date, nullable=False)
    descripcion_entrenamiento: Mapped[str] = mapped_column(String(500), nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now(timezone.utc), nullable=False
    )
    fecha_modificacion: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now(timezone.utc),
        onupdate=datetime.now(timezone.utc),
        nullable=False,
    )

    # Relaciones
    usuario: Mapped["Usuario"] = relationship(
        "Usuario", back_populates="entrenamientos"
    )
    # rendimientos_entrenamiento: Mapped[list["RendimientoEntrenamiento"]] = relationship("RendimientoEntrenamiento", back_populates="entrenamiento", cascade="all, delete-orphan")
    # cancha: Mapped["Cancha"] = relationship("Cancha", back_populates="entrenamientos")
