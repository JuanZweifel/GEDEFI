from sqlalchemy import ForeignKey
from sqlalchemy import String, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import date, datetime
from app.db import Base


class OrdenPago(Base):
    __tablename__ = "ORDEN_PAGO"

    id_orden: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    fecha_emision: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    monto_orden: Mapped[int] = mapped_column(Integer, nullable=False)
    descripcion_orden: Mapped[str] = mapped_column(String(500), nullable=True)
    fecha_vencimiento: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    # Claves foraneas
    id_club: Mapped[int] = mapped_column(
        Integer, ForeignKey("CLUB.id_club"), nullable=False
    )

    # Relaciones
    club: Mapped["Club"] = relationship("Club", back_populates="ordenes_pago")
