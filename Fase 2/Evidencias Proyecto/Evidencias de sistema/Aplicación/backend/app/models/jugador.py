from sqlalchemy import String, Integer, Date, Boolean, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date, datetime, timezone
from app.db import Base


class Jugador(Base):
    __tablename__ = "JUGADOR"

    rut_jugador: Mapped[str] = mapped_column(String(10), primary_key=True, index=True)
    primer_nombre: Mapped[str] = mapped_column (String(30), nullable=False)
    segundo_nombre: Mapped[str] = mapped_column(String(30), nullable=True)
    primer_apellido: Mapped[str] = mapped_column(String(30), nullable=False)
    segundo_apellido: Mapped[str] = mapped_column(String(30), nullable=True)
    genero: Mapped[bool] = mapped_column(Boolean, nullable=False)
    fecha_nacimiento: Mapped[date] = mapped_column(Date, nullable=False)
    enfermedades_cronicas: Mapped[str] = mapped_column(String(500), nullable=True, default="Sin enfermedades crónicas")
    fono_jugador: Mapped[str] = mapped_column(String(12), nullable=True)
    jugador_activo:Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc), nullable=False)
    fecha_modificacion: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc), nullable=False, onupdate=datetime.now(timezone.utc))

        #relaciones
    lesiones: Mapped[list["Lesion"]] = relationship(
        "Lesion", back_populates="jugador"
    )

    detalles_club_jugador: Mapped[list["DetalleClubJugador"]] = relationship(
        "DetalleClubJugador", back_populates="jugador", passive_deletes=False
    )

    fichas_jugador: Mapped[list["FichaJugador"]] = relationship(
        "FichaJugador", back_populates="jugador", passive_deletes=False
    )

    rendimientos_entrenamiento: Mapped[list["RendimientoEntrenamiento"]] = relationship(
        "RendimientoEntrenamiento", back_populates="jugador", passive_deletes=False
    )

    usos_fas: Mapped[list["UsoFas"]] = relationship("UsoFas", back_populates="jugador")