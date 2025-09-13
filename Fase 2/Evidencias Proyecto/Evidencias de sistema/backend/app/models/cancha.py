from sqlalchemy import String, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from app.db import Base
from models import Calendario


class Cancha(Base):
    __tablename__ = "CANCHA"

    id_cancha: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre_cancha: Mapped[str] = mapped_column(String, nullable=False)
    direccion_cancha: Mapped[str] = mapped_column(String, nullable=False)
    disponible: Mapped[bool] = mapped_column(Boolean, nullable=True)

    # Relaciones
    calendario: Mapped[list["Calendario"]] = relationship(
        "CALENDARIO", back_populates="cancha", cascade="all, delete-orphan"
    )