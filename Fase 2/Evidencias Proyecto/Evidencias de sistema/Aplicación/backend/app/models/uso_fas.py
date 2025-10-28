from sqlalchemy import Integer, String, Date, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from app.db import Base


class UsoFas(Base):
    __tablename__ = "USO_FAS"

    id_uso_fas: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    id_fas: Mapped[int] = mapped_column(ForeignKey("FAS.id_fas"), nullable=False)
    rut_jugador: Mapped[str] = mapped_column(ForeignKey("JUGADOR.rut_jugador"), nullable=False)

    descripcion_gasto: Mapped[str] = mapped_column(String(500), nullable=True)
    monto_usado: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    fecha_uso: Mapped[Date] = mapped_column(Date, nullable=False)

    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now(timezone.utc), nullable=False
    )
    fecha_modificacion: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now(timezone.utc),
        nullable=False,
        onupdate=datetime.now(timezone.utc),
    )

    # Relaciones
    fas: Mapped["Fas"] = relationship("Fas", back_populates="usos_fas")

    jugador: Mapped["Jugador"] = relationship("Jugador", back_populates="usos_fas")