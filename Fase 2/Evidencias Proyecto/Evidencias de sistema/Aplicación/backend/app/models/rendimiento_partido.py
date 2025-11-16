from sqlalchemy import Date, String, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from app.db import Base
from sqlalchemy import ForeignKey, ForeignKeyConstraint
from datetime import date


class RendimientoPartido(Base):
    __tablename__ = "RENDIMIENTO_PARTIDO"

    tiempo_jugado: Mapped[int] = mapped_column(Integer, nullable=True)
    goles: Mapped[int] = mapped_column(Integer, nullable=False)
    asistencias: Mapped[int] = mapped_column(Integer, nullable=False)
    amonestaciones: Mapped[int] = mapped_column(Integer, nullable=True)
    amonestaciones_amarillas: Mapped[bool] = mapped_column(Boolean, nullable=False)
    amonestaciones_rojas: Mapped[bool] = mapped_column(Boolean, nullable=False)
    id_partido: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("PARTIDO.id_partido"),
        primary_key=True,
        nullable=False,
        index=True,
    )
    rut_jugador: Mapped[str] = mapped_column(
        String(10), nullable=False, primary_key=True, index=True
    )
    id_serie: Mapped[int] = mapped_column(Integer, nullable=False, primary_key=True)

    fecha_ini: Mapped[date] = mapped_column(Date, nullable=False, primary_key=True)

    fecha_ini: Mapped[date] = mapped_column(Date, nullable= False)

    __table_args__ = (
        ForeignKeyConstraint(
            ["rut_jugador", "id_serie", "fecha_ini"],
            ["FICHA_JUGADOR.rut_jugador", "FICHA_JUGADOR.id_serie", "FICHA_JUGADOR.fecha_ini"],
        ),
    )

    # Relaciones
    ficha_jugador: Mapped["FichaJugador"] = relationship(
        "FichaJugador", back_populates="rendimientos_partido"
    )

    partido: Mapped["Partido"] = relationship(
        "Partido", back_populates="rendimientos_partido"
    )
