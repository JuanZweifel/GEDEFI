from sqlalchemy import String, Integer, Date, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey
from datetime import date
from app.db import Base
from .ficha_jugador import FichaJugador

class EvaluacionFisica(Base):
    __tablename__ = "EVALUACION_FISICA"

    fecha_evaluacion: Mapped[date] = mapped_column(Date, primary_key=True, index=True)
    peso_jugador: Mapped[int] = mapped_column(Integer, nullable=False)
    estatura_jugador: Mapped[int] = mapped_column(Integer, nullable=False)
    IMC_jugador: Mapped[float] = mapped_column(nullable=False)
    talla_camiseta: Mapped[str] = mapped_column(String(5), nullable=True)
    talla_short: Mapped[str] = mapped_column(String(5), nullable=True)
    talla_medias: Mapped[str] = mapped_column(String(5), nullable=True)
    rut_jugador: Mapped[str] = mapped_column(String(10), ForeignKey("FICHA_JUGADOR.rut_jugador"), nullable=False)

    # Relaciones
    ficha_jugador: Mapped[FichaJugador] = relationship(FichaJugador, back_populates="evaluaciones_fisicas", cascade="all, delete-orphan")