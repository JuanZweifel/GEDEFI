from sqlalchemy import String, Integer, Date
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey
from datetime import date
from app.db import Base
from .ficha_jugador import FichaJugador
from .serie import Serie

class EstadisticasJugador(Base):
    __tablename__ = "ESTADISTICAS_JUGADOR"

    rut_jugador: Mapped[str] = mapped_column(String(10), ForeignKey("FICHA_JUGADOR.rut_jugador"), primary_key=True)
    id_serie: Mapped[int] = mapped_column(Integer, ForeignKey("SERIE.id_serie"), primary_key=True)
    # id_partido: Mapped[int] = mapped_column(Integer, primary_key=True) SE DEBE ASOCIAR A LA TABLA PARTIDO
    goles: Mapped[int] = mapped_column(Integer, default=0)
    asistencias: Mapped[int] = mapped_column(Integer, default=0)
    faltas_cometidas: Mapped[int] = mapped_column(Integer, default=0)
    tarjetas_amarillas: Mapped[int] = mapped_column(Integer, default=0)
    tarjetas_rojas: Mapped[int] = mapped_column(Integer, default=0)
    fecha_medicion: Mapped[date] = mapped_column(Date, default=date.today)

    # Relaciones
    ficha_jugador: Mapped[FichaJugador] = relationship(FichaJugador, back_populates="estadisticas_jugadores", cascade="all, delete-orphan")
    serie: Mapped["Serie"] = relationship(Serie, back_populates="estadisticas_jugadores", cascade="all, delete-orphan")
    # partido: Mapped["Partido"] = relationship("PARTIDO", back_populates="estadisticas_jugadores", cascade="all, delete-orphan")