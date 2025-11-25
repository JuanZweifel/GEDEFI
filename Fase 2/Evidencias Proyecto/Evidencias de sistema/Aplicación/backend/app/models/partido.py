from sqlalchemy import Integer, Date, Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import date, datetime, timezone, time
from app.db import Base
from sqlalchemy import ForeignKey, Time, Enum as SQLEnum
from enum import Enum


class EstadoPartidoEnum(str, Enum):
    PROGRAMADO = "programado"
    EN_CURSO = "en_curso"
    FINALIZADO = "finalizado"
    CANCELADO = "cancelado"


class TipoPartidoEnum(str, Enum):
    CAMPEONATO = "campeonato"
    AMISTOSO = "amistoso"
    PLAYOFF = "playoff"
    FINAL = "final"


class Partido(Base):
    __tablename__ = "PARTIDO"

    id_partido: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    fecha_partido: Mapped[date] = mapped_column(Date, nullable=False)
    hora_ini_partido: Mapped[time] = mapped_column(Time, nullable=False)
    hora_fin_partido: Mapped[time] = mapped_column(Time, nullable=True)
    goles_local: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    goles_visita: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    estado_partido: Mapped[EstadoPartidoEnum] = mapped_column(
        SQLEnum(EstadoPartidoEnum, name="estado_partido_enum"),
        default=EstadoPartidoEnum.PROGRAMADO,
        nullable=False,
    )
    tipo_partido: Mapped[TipoPartidoEnum] = mapped_column(
        SQLEnum(TipoPartidoEnum, name="tipo_partido_enum"),
        default=TipoPartidoEnum.CAMPEONATO,
        nullable=False,
    )
    observaciones: Mapped[str] = mapped_column(String(500), nullable=False)
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
        Integer, ForeignKey("CANCHA.id_cancha"), nullable=True #TODO: SE DEBE VIGILAR LA OBLIGACIÓN DE CANCHA PARA UN PARTIDO
    )
    id_serie_local: Mapped[int] = mapped_column(
        Integer, ForeignKey("SERIE.id_serie"), nullable=False
    )
    id_serie_visitante: Mapped[int] = mapped_column(
        Integer, ForeignKey("SERIE.id_serie"), nullable=False
    )

    # relaciones
    rendimientos_partido: Mapped[list["RendimientoPartido"]] = relationship(
        "RendimientoPartido", back_populates="partido", passive_deletes=False
    )

    cancha: Mapped["Cancha"] = relationship("Cancha", back_populates="partido")

    serie_local: Mapped["Serie"] = relationship(
        "Serie",
        back_populates="partidos_local",
        foreign_keys=[id_serie_local],
        passive_deletes=False,
    )

    serie_visitante: Mapped["Serie"] = relationship(
        "Serie",
        back_populates="partidos_visitante",
        foreign_keys=[id_serie_visitante],
        passive_deletes=False,
    )

    estados_partido: Mapped[list["DetalleEstadoPartido"]] = relationship(
        "DetalleEstadoPartido",
        back_populates="partido",
        passive_deletes=False
    )
