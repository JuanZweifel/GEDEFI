from sqlalchemy import Date, String, Integer,DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import date, datetime, timezone
from app.db import Base
from sqlalchemy import ForeignKey


class FichaJugador(Base):
    __tablename__ = "FICHA_JUGADOR"

    fecha_ini: Mapped[date] = mapped_column(Date, nullable=False)
    fecha_fin: Mapped[date] = mapped_column(Date, nullable=True)
    talla_camiseta:Mapped[str] = mapped_column(String(5), nullable=False)
    talla_short:Mapped[str] = mapped_column(String(5), nullable=False)
    talla_media:Mapped[str] = mapped_column(String(2), nullable=False)
    talla_botin:Mapped[str] = mapped_column(String(2), nullable=False)
    estatura:Mapped[int]= mapped_column(Integer, nullable=False)
    Peso:Mapped[int] = mapped_column(Integer, nullable=False)
    imc:Mapped[int] = mapped_column(Integer, nullable=False)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc), nullable=False)
    fecha_modificacion: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc), nullable=False, onupdate=datetime.now(timezone.utc))
    rut_jugador:Mapped[str] = mapped_column(String(10), ForeignKey("JUGADOR.rut_jugador"), primary_key=True, nullable=False, index=True)
    #id_serie:Mapped[int] = mapped_column(Integer, ForeignKey("SERIE.id_serie"), primary_key=True, nullable=False, index=True)

    #Relaciones
    jugador: Mapped["Jugador"] = relationship(
        "Jugador", back_populates="fichas_jugador"
    )

    #rendimiento_partido: Mapped[list["RendimientoPartido"]] = relationship(
        #"RendimientoPartido", back_populates="ficha_jugador"
    #)