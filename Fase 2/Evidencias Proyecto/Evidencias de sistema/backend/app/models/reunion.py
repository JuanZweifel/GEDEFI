from sqlalchemy import ForeignKey
from sqlalchemy import String, Integer, Date
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import date
from app.db import Base


class Reunion(Base):
    __tablename__ = "REUNION"

    id_reunion: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tipo_reunion: Mapped[int] = mapped_column(Integer, nullable=False)
    fecha_reunion: Mapped[date] = mapped_column(Date, nullable=False)
    desc_reunion: Mapped[str] = mapped_column(String(500), nullable=True)

    # Relaciones
    # asistencias_reunion: Mapped[list["Asistencia_reunion"]] = relationship(
    #     "ASISTENCIA_REUNION", back_populates="reunion", cascade="all, delete-orphan"
    # )
