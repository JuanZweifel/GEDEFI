from sqlalchemy import ForeignKey, String, Integer, Boolean, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from app.db import Base
from datetime import datetime


class Serie(Base):
    __tablename__ = "SERIE"

    id_serie: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre_serie: Mapped[str] = mapped_column(String(100), nullable=False)
    serie_activa: Mapped[bool] = mapped_column(Boolean, default=True)
    id_club: Mapped[int] = mapped_column(ForeignKey("CLUB.id_club"), nullable=False)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, default=func.now(), nullable=False)
    fecha_modificacion: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relaciones
    club: Mapped["Club"] = relationship("Club", back_populates="series")

    #partidos_local: Mapped[list["Partido"]] = relationship(
    #    "Partido", back_populates="serie_local", foreign_keys='Partido.id_serie_local', cascade="all, delete-orphan")
    
    #partidos_visitante: Mapped[list["Partido"]] = relationship(
    #    "Partido", back_populates="serie_visitante", foreign_keys='Partido.id_serie_visitante', cascade="all, delete-orphan")
    
    #fichas_jugador: Mapped[list["FichaJugador"]] = relationship("FichaJugador", back_populates="serie", cascade="all, delete-orphan")
