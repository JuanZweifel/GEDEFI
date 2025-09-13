from __future__ import annotations
from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.db import Base
from sqlalchemy.orm import relationship
from typing import Optional


class Pais(Base):
    __tablename__ = "PAIS"

    id_pais: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre_pais: Mapped[str] = mapped_column(String(100), nullable=False)
    codigo_iso3: Mapped[Optional[str]] = mapped_column(String(3), nullable=True)

    # Relaciones
    jugadores: Mapped[list["FichaJugador"]] = relationship(
        "FichaJugador", back_populates="pais", cascade="all, delete-orphan"
    )
