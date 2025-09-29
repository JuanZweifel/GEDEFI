from sqlalchemy import ForeignKey
from sqlalchemy import String, Integer, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import date, datetime, timezone
from app.db import Base


class OrdenPago(Base):
    __tablename__ = "ORDEN_PAGO"

    id_orden_pago: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tipo_orden: Mapped[int] = mapped_column(Integer, nullable=False)
    tipo_pago: Mapped[int] = mapped_column(Integer, nullable=False)
    monto: Mapped[float] = mapped_column(nullable=False)
    metodo_pago: Mapped[int] = mapped_column(Integer, nullable=True)
    numero_transaccion: Mapped[str] = mapped_column(String(50), nullable=True)
    descripcion: Mapped[str] = mapped_column(String(500), nullable=True)
    orden_activa: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    fecha_emision: Mapped[date] = mapped_column(
        DateTime, default=datetime.now(timezone.utc), nullable=False
    )
    fecha_vencimiento: Mapped[date] = mapped_column(DateTime, nullable=True)
    fecha_pago: Mapped[date] = mapped_column(DateTime, nullable=True)
    id_club: Mapped[int] = mapped_column(ForeignKey("CLUB.id_club"), nullable=True)
    fecha_modificacion: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now(timezone.utc),
        onupdate=datetime.now(timezone.utc),
        nullable=False,
    )
    usuario_emisor: Mapped[str] = mapped_column(
        ForeignKey("USUARIO.rut_usuario"), nullable=False
    )
    usuario_pago: Mapped[str] = mapped_column(
        ForeignKey("USUARIO.rut_usuario"), nullable=True
    )

    # Relaciones
    emisor: Mapped["Usuario"] = relationship(
        "Usuario", foreign_keys=[usuario_emisor], back_populates="ordenes_emitidas"
    )

    pagador: Mapped["Usuario"] = relationship(
        "Usuario", foreign_keys=[usuario_pago], back_populates="ordenes_pagadas"
    )

    club: Mapped["Club"] = relationship("Club", back_populates="ordenes_pago")
