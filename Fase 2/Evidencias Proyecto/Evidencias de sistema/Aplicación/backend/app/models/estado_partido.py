from sqlalchemy import Integer, Enum as SQLEnum, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from app.db import Base
import enum
from datetime import datetime, timezone


class EstadoPartidoEnum(str, enum.Enum):
    programado = "Programado"
    finalizado = "Finalizado"
    cancelado = "Cancelado"
    en_curso = "En curso"


class EstadoPartido(Base):
    __tablename__ = "ESTADO_PARTIDO"

    id_estado: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    estado: Mapped[EstadoPartidoEnum] = mapped_column(
        SQLEnum(EstadoPartidoEnum, name="estado_partido_enum"),
        nullable=False
    )
    descripcion: Mapped[str] = mapped_column(String(500), nullable=True)
    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now(timezone.utc), nullable=False
    )
    fecha_modificacion: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now(timezone.utc),
        nullable=False,
        onupdate=datetime.now(timezone.utc),
    )

    # Relaciones
    detalles_estado: Mapped[list["DetalleEstadoPartido"]] = relationship(
        "DetalleEstadoPartido",
        back_populates="estado",
        passive_deletes=False
    )