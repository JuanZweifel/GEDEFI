from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from app.db import Base


class Asociacion(Base):
    __tablename__ = "ASOCIACION"

    id_asociacion: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre_asociacion: Mapped[str] = mapped_column(String(100), nullable=False)

    # Relaciones
    contratos_club: Mapped[list["ContratoClub"]] = relationship(
        "ContratoClub", back_populates="asociacion"
    )
