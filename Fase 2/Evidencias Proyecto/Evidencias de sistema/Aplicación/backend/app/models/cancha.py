from sqlalchemy import String, Integer, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db import Base

class Cancha(Base):
    __tablename__ = "CANCHA"

    id_cancha: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre_cancha: Mapped[str] = mapped_column (String(50), nullable=False)
    tipo_cancha: Mapped[int] = mapped_column(Integer, nullable=False)
    direccion: Mapped[str] = mapped_column(String(300), nullable=True)
    disponibilidad: Mapped[bool] = mapped_column(Boolean, nullable=False)
    cancha_activa: Mapped[bool] = mapped_column(Boolean, nullable=False)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc), nullable=False)
    fecha_modificacion: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc), nullable=False, onupdate=datetime.now(timezone.utc))

    #Relaciones
    partido: Mapped[list["Partido"]] = relationship(
        "Partido", back_populates="cancha"
    )

    entrenamientos: Mapped["Entrenamiento"] = relationship("Entrenamiento", back_populates="cancha")
