from sqlalchemy import String, Integer, Date
from sqlalchemy.orm import Mapped, mapped_column
from datetime import date
from app.db import Base


class Castigo(Base):
    __tablename__ = "CASTIGO"

    id_castigo: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    rut_jugador: Mapped[str] = mapped_column(String, nullable=False)
    descripcion_castigo: Mapped[str] = mapped_column(String, nullable=False)
    fecha_ini_castigo: Mapped[date] = mapped_column(Date, nullable=True)
    fecha_ter_castigo: Mapped[date] = mapped_column(Date, nullable=False)
    duracion: Mapped[int] = mapped_column(Integer, nullable=False)