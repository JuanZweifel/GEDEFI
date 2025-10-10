from sqlalchemy import String, Integer, Date, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import datetime, date, timezone
from app.db import Base


class Club(Base):
    __tablename__ = "CLUB"

    id_club: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    rut_club: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    nombre_club: Mapped[str] = mapped_column(String(250), nullable=False, unique=True)
    fecha_fundacion: Mapped[date] = mapped_column(Date, nullable=False)
    fono_club: Mapped[str] = mapped_column(String(12), nullable=True)
    direccion_club: Mapped[str] = mapped_column(String(500), nullable=False)
    email_club: Mapped[str] = mapped_column(String(320), nullable=False, unique=True)
    logo_club: Mapped[str] = mapped_column(String(255), nullable=False)
    color_primario: Mapped[str] = mapped_column(String(7), nullable=False)
    color_secundario: Mapped[str] = mapped_column(String(7), nullable=False)
    color_respaldo: Mapped[str] = mapped_column(String(7), nullable=True)
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
        "OrdenPago", back_populates="club", passive_deletes=False
    )

    detalles_usuario: Mapped[list["DetalleUsuarioClub"]] = relationship(
        "DetalleUsuarioClub", back_populates="club", passive_deletes=False
    )

    detalles_club_jugador: Mapped[list["DetalleClubJugador"]] = relationship(
        "DetalleClubJugador", back_populates="club", passive_deletes=False
    )

    series: Mapped[list["Serie"]] = relationship(
        "Serie", back_populates="club", passive_deletes=False
    )

    ordenes_pago: Mapped[list["OrdenPago"]] = relationship(
        "OrdenPago", back_populates="club", passive_deletes=False
    )
