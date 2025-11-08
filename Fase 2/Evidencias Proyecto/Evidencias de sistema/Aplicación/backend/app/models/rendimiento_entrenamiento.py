from sqlalchemy import String, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from app.db import Base
from sqlalchemy import ForeignKey


class RendimientoEntrenamiento(Base):
    __tablename__ = "RENDIMIENTO_ENTRENAMIENTO"

    frecuencia_cardiaca: Mapped[int] = mapped_column(Integer, nullable=True)
    velocidad: Mapped[int] = mapped_column(Integer, nullable=True)
    duracion_recorrido:Mapped[int] = mapped_column(Integer, nullable=True)
    nivel_oxigeno:Mapped[int] = mapped_column(Integer,  nullable=True)
    observaciones: Mapped[str] = mapped_column(String(500), nullable=True)
    asistencia: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    rut_jugador:Mapped[str] = mapped_column(String(10), ForeignKey("JUGADOR.rut_jugador"), primary_key=True, nullable=False)
    id_entrenamiento:Mapped[int] = mapped_column(Integer, ForeignKey("ENTRENAMIENTO.id_entrenamiento"), primary_key=True, nullable=False, index=True)

    #Relaciones
    jugador: Mapped["Jugador"] = relationship(
        "Jugador", back_populates="rendimientos_entrenamiento"
    )

    entrenamiento: Mapped["Entrenamiento"] = relationship(
        "Entrenamiento", back_populates="rendimientos_entrenamiento"
    )