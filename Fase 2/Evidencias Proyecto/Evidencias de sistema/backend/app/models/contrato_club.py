from sqlalchemy import Integer, Date
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from app.db import Base
from sqlalchemy import ForeignKey
from datetime import date


class ContratoClub(Base):

    __tablename__ = "CONTRATO_CLUB"

    id_asociacion: Mapped[int] = mapped_column(
        Integer, ForeignKey("ASOCIACION.id_asociacion"), primary_key=True
    )
    id_club: Mapped[int] = mapped_column(
        Integer, ForeignKey("CLUB.id_club"), primary_key=True
    )
    fecha_contrato: Mapped[date] = mapped_column(Date, nullable=False)

    # Relaciones
    asociacion: Mapped["Asociacion"] = relationship(
        "Asociacion", back_populates="contratos_club"
    )
    club: Mapped["Club"] = relationship("Club", back_populates="contratos_club")
    series: Mapped[list["Serie"]] = relationship(
        "Serie", back_populates="contrato_club"
    )
