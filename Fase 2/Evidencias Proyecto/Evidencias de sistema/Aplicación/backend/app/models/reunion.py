from sqlalchemy import String, Integer, DateTime, Date
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import date, datetime, timezone
from app.db import Base


class Reunion(Base):
    __tablename__ = "REUNION"

    id_reunion: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tipo_reunion: Mapped[int] = mapped_column(Integer, nullable=False)
    fecha_reunion: Mapped[date] = mapped_column(Date, nullable=False)
    desc_reunion: Mapped[str] = mapped_column(String(500), nullable=True)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc), nullable=False)
    fecha_modificacion: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc), nullable=False)

    # Relaciones
    detalles_reunion: Mapped[list["DetalleReunion"]] = relationship("DetalleReunion", back_populates="reunion", passive_deletes=False)
