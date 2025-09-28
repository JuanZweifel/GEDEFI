from sqlalchemy import ForeignKey
from sqlalchemy import String, Integer, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from app.db import Base
import datetime


class Serie(Base):
    __tablename__ = "SERIE"

    id_serie: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre_serie: Mapped[str] = mapped_column(String(100), nullable=False)
    serie_activa: Mapped[bool] = mapped_column(Boolean, default=True)
    id_club: Mapped[int] = mapped_column(ForeignKey("CLUB.id_club"), nullable=False)
    fecha_creacion: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.now, nullable=False)
    fecha_modificacion: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.now, onupdate=datetime.datetime.now, nullable=False)

    # Relaciones
    club: Mapped["Club"] = relationship("Club", back_populates="series")

    partidos_local: Mapped[list["Partido"]] = relationship(
        "Partido", back_populates="serie_local", foreign_keys='Partido.id_serie_local', cascade="all, delete-orphan")
    
    partidos_visitante: Mapped[list["Partido"]] = relationship(
        "Partido", back_populates="serie_visitante", foreign_keys='Partido.id_serie_visitante', cascade="all, delete-orphan")
    
    fichas_jugador: Mapped[list["FichaJugador"]] = relationship("FichaJugador", back_populates="serie", cascade="all, delete-orphan")
