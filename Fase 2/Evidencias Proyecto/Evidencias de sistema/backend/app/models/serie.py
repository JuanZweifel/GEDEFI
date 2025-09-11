from sqlalchemy import ForeignKeyConstraint
from sqlalchemy import String, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from app.db import Base


class Serie(Base):
    __tablename__ = "SERIE"

    id_serie: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre_serie: Mapped[str] = mapped_column(String(100), nullable=False)
    activa: Mapped[bool] = mapped_column(Boolean, default=True)
    id_asociacion: Mapped[int] = mapped_column(Integer, nullable=False)
    id_club: Mapped[int] = mapped_column(Integer, nullable=False)

    # Relaciones

    __table_args__ = (
        ForeignKeyConstraint(
            ["id_asociacion", "id_club"],
            ["CONTRATO_CLUB.id_asociacion", "CONTRATO_CLUB.id_club"],
        ),
    )

    contrato_club: Mapped["ContratoClub"] = relationship("ContratoClub", back_populates="series")

    estadisticas_jugador: Mapped[list["EstadisticasJugador"]] = relationship(
        "EstadisticasJugador", back_populates="serie"
    )
