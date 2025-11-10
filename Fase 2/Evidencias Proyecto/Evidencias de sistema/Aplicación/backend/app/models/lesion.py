from sqlalchemy import String, Integer, Date, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import date, datetime, timezone
from app.db import Base
from sqlalchemy import ForeignKey


class Lesion(Base):
    __tablename__ = "LESION"

    id_lesion: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre_lesion: Mapped[str] = mapped_column (String(100), nullable=False)
    tipo_lesion: Mapped[bool] = mapped_column(Boolean, nullable=False)
    descripcion: Mapped[str] = mapped_column(String(500), nullable=False)
    tiempo_recuperacion: Mapped[int] = mapped_column(Integer, nullable=True)
    fecha_lesion: Mapped[date] = mapped_column(Date, nullable=False)
    fecha_fin_lesion: Mapped[date] = mapped_column(Date, nullable=True)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc), nullable=False)
    fecha_modificacion: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc), nullable=False, onupdate=datetime.now(timezone.utc))
    rut_jugador:Mapped[str] = mapped_column(String(10), ForeignKey("JUGADOR.rut_jugador"), nullable=False, index=True)

    #relaciones
    jugador: Mapped["Jugador"] = relationship(
        "Jugador", back_populates="lesiones"
    )