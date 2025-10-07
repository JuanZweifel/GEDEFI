from sqlalchemy import Integer, Date, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import date, datetime, timezone
from app.db import Base
from sqlalchemy import ForeignKey


class Partido(Base):
    __tablename__ = "PARTIDO"

    id_partido: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    fecha_partido: Mapped[date] = mapped_column(Date, nullable=False)
    goles_local: Mapped[int] = mapped_column(Integer, nullable=True)
    goles_visita: Mapped[int] = mapped_column(Integer, nullable=True)
    partido_activo: Mapped[bool] = mapped_column(Boolean, nullable=False)
    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now(timezone.utc), nullable=False
    )
    fecha_modificacion: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now(timezone.utc),
        nullable=False,
        onupdate=datetime.now(timezone.utc),
    )
    id_cancha: Mapped[int] = mapped_column(
        Integer, ForeignKey("CANCHA.id_cancha"), nullable=False, index=True
    )
    id_serie_local: Mapped[int] = mapped_column(
        Integer, ForeignKey("SERIE.id_serie"), nullable=False, index=True
    )
    id_serie_visitante: Mapped[int] = mapped_column(
        Integer, ForeignKey("SERIE.id_serie"), nullable=False, index=True
    )

    # relaciones
    rendimientos_partido: Mapped[list["RendimientoPartido"]] = relationship(
        "RendimientoPartido", back_populates="partido"
    )

    cancha: Mapped["Cancha"] = relationship("Cancha", back_populates="partido")

    serie_local: Mapped["Serie"] = relationship(
        "Serie", back_populates="partidos_local", foreign_keys=[id_serie_local]
    )

    serie_visitante: Mapped["Serie"] = relationship(
        "Serie", back_populates="partidos_visitante", foreign_keys=[id_serie_visitante]
    )
