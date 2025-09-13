from sqlalchemy import ForeignKey
from sqlalchemy import Integer, Date
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import date
from app.db import Base
from models import Cancha


class Calendario(Base):
    __tablename__ = "CALENDARIO"

    fecha_evento: Mapped[date] = mapped_column(Date, nullable=False)
    serie_visitante: Mapped[int] = mapped_column(Integer, ForeignKey("SERIE.id_serie"), nullable=False)
    serie_local: Mapped[int] = mapped_column(Integer, ForeignKey("SERIE.id_serie"), nullable=False)

    # Relaciones
    # serie_visitante: Mapped[list["Serie"]] = relationship(
    #    "SERIE", back_populates="calendario", cascade="all, delete-orphan"
    # )

    # serie_local: Mapped[list["Serie"]] = relationship(
    #    "SERIE", back_populates="calendario", cascade="all, delete-orphan"
    # )

    nombre_cancha: Mapped[list["Cancha"]] = relationship(
        "CANCHA", back_populates="calendario", cascade="all, delete-orphan"
    )