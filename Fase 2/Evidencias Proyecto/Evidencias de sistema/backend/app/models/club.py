from sqlalchemy import String, Integer, Date, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import datetime, date, timezone
from app.db import Base


class Club(Base):
    __tablename__ = "CLUB"

    id_club: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre_club: Mapped[str] = mapped_column(String(250), nullable=False, unique=True)
    fecha_fundacion: Mapped[date] = mapped_column(Date, nullable=False)
    fono_club: Mapped[str] = mapped_column(String(12), nullable=True)
    direccion_club: Mapped[str] = mapped_column(String(500), nullable=False)
    email_club: Mapped[str] = mapped_column(String(320), nullable=False, unique=True)
    club_activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
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
    ordenes_pago: Mapped[list["OrdenPago"]] = relationship(
        "OrdenPago", back_populates="club", cascade="all, delete-orphan"
    )

    detalles_usuario: Mapped[list["DetalleUsuarioClub"]] = relationship(
        "DetalleUsuarioClub", back_populates="club", cascade="all, delete-orphan"
    )

    detalles_jugadores_club: Mapped[list["DetalleJugadorClub"]] = relationship(
        "DetalleJugadorClub", back_populates="club", cascade="all, delete-orphan"
    )

    series: Mapped[list["Serie"]] = relationship(
        "Serie", back_populates="club", cascade="all, delete-orphan"
    )

    ordenes_pago: Mapped[list["OrdenPago"]] = relationship(
        "OrdenPago", back_populates="club", cascade="all, delete-orphan"
    )
