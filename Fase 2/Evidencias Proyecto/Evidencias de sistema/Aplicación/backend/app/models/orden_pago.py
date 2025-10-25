from sqlalchemy import ForeignKey, event, Enum as SQLEnum, String, Integer, DateTime, Sequence
from sqlalchemy.orm import Mapped, mapped_column, Session
from typing import Optional
from sqlalchemy.orm import relationship, declarative_base
from datetime import date, datetime, timezone
from app.db import Base
import enum

# Secuencias separadas por tipo de movimiento
seq_ingreso = Sequence('seq_ingreso_id', start=1, increment=1, metadata=Base.metadata)
seq_egreso = Sequence('seq_egreso_id', start=1, increment=1, metadata=Base.metadata)


class EstadoOrdenEnum(str, enum.Enum):
    pendiente = "Pendiente"
    anulada = "Anulada"
    pagada = "Pagada"
    vencida = "Vencida"

class TipoPagoEnum(str, enum.Enum):
    na = "N/A"
    efectivo = "Efectivo"
    transferencia = "Transferencia"
    pago_linea = "Pago en linea"
    otro = "otro"

class TipoMovimientoEnum(str, enum.Enum):
    ingreso = "Ingreso"
    egreso = "Egreso"

class OrdenPago(Base):
    __tablename__ = "ORDEN_PAGO"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    id_orden_pago: Mapped[str] = mapped_column(String(12), unique=True, nullable=False)
    tipo_orden: Mapped[str] = mapped_column(String(100), nullable=False)
    tipo_movimiento: Mapped[TipoMovimientoEnum] = mapped_column(
        SQLEnum(TipoMovimientoEnum, name="tipo_movimiento_enum"),
        nullable=False
    )
    tipo_pago: Mapped[Optional[TipoPagoEnum]] = mapped_column(
        SQLEnum(TipoPagoEnum, name="metodo_pago_enum"),
        nullable=False,
        default=TipoPagoEnum.na
    )
    monto: Mapped[float] = mapped_column(nullable=False)
    metodo_pago: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    numero_transaccion: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    descripcion: Mapped[str] = mapped_column(String(500), nullable=True)
    estado_orden: Mapped[EstadoOrdenEnum] = mapped_column(
        SQLEnum(EstadoOrdenEnum, name="estado_orden_enum"),
        nullable=False,
        default=EstadoOrdenEnum.pendiente
    )
    fecha_emision: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now(timezone.utc), nullable=False
    )
    fecha_vencimiento: Mapped[date] = mapped_column(DateTime, nullable=True)
    fecha_pago: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    id_club: Mapped[int] = mapped_column(ForeignKey("CLUB.id_club"), nullable=True)
    fecha_modificacion: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now(timezone.utc),
        onupdate=datetime.now(timezone.utc),
        nullable=False,
    )
    # Relaciones
    usuario_emisor: Mapped[str] = mapped_column(
        ForeignKey("USUARIO.rut_usuario"), nullable=False
    )
    usuario_pago: Mapped[Optional[str]] = mapped_column(
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

#Eventos
@event.listens_for(OrdenPago, "before_insert")
def generar_id_orden(mapper, connection, target):
    if target.tipo_movimiento == TipoMovimientoEnum.ingreso:
        prefix = "ING"
        seq = seq_ingreso
    else:
        prefix = "EGR"
        seq = seq_egreso

    # PostgreSQL maneja la secuencia y devuelve el número nuevo
    new_num = connection.execute(seq.next_value())
    num_valor = new_num.scalar()

    # Generar el ID formateado
    target.id_orden_pago = f"{prefix}-{num_valor:08d}"
