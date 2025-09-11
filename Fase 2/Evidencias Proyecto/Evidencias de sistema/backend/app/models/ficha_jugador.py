from sqlalchemy import String, Integer, Date, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import date
from app.db import Base

class FichaJugador(Base):
    __tablename__ = "FICHA_JUGADOR"

    rut_jugador: Mapped[str] = mapped_column(String(10), primary_key=True, index=True)
    primer_nombre: Mapped[str] = mapped_column(String(12), nullable=False)
    segundo_nombre: Mapped[str] = mapped_column(String(12), nullable=True)
    primer_apellido: Mapped[str] = mapped_column(String(12), nullable=False)
    segundo_apellido: Mapped[str] = mapped_column(String(12), nullable=True)
    enfermedades_cronicas: Mapped[str] = mapped_column(String(500), nullable=True)
    fecha_nacimiento: Mapped[date] = mapped_column(Date, nullable=False)
    nacionalidad: Mapped[str] = mapped_column(String(30), nullable=False)
    correo_electronico: Mapped[str] = mapped_column(String(320), nullable=False, unique=True)
    pierna_habil: Mapped[int] = mapped_column(Integer, nullable=True)  # 1: derecha, 2: izquierda, 3: ambas
    genero: Mapped[bool] = mapped_column(Boolean, nullable=False)  # True: masculino, False: femenino

    # Relaciones
    # estadisticas_jugador: Mapped[list["Estadistica_jugador"]] = relationship(
    #     "ESTADISTICA_JUGADOR", back_populates="ficha_jugador", cascade="all, delete-orphan"
    # )
    # evaluaciones_fisicas: Mapped[list["Evaluacion_fisica"]] = relationship(
    #     "EVALUACION_FISICA", back_populates="ficha_jugador", cascade="all, delete-orphan"
    # )
    # lesiones: Mapped[list["Lesion"]] = relationship(
    #     "LESION", back_populates="ficha_jugador", cascade="all    , delete-orphan"
    # )