from sqlalchemy import ForeignKey, event, select, Enum as SQLEnum
from sqlalchemy import String, Integer, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column, Session
from typing import Optional
from sqlalchemy.orm import relationship
from datetime import date, datetime, timezone
from app.db import Base
import enum


def generar_id_orden(mapper, connection, target):
    prefix = "ING" if target.tipo_movimiento.lower() == "ingreso" else "EGR"
    session = Session(bind=connection)
    
    # Buscar el último ID con ese prefijo
    last_id = session.execute(
        select(OrdenPago.id_orden_pago)
        .where(OrdenPago.id_orden_pago.like(f"{prefix}-%"))
        .order_by(OrdenPago.id_orden_pago.desc())
        .limit(1)
    ).scalar_one_or_none()
    
    # Extraer número o iniciar desde 0
    if last_id:
        last_num = int(last_id.split("-")[1])
    else:
        last_num = 0
    
    new_num = last_num + 1
    target.id_orden_pago = f"{prefix}-{new_num:08d}"
    
    session.close()

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

    id_orden_pago: Mapped[str] = mapped_column(String(12), primary_key=True, index=True)
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
event.listen(OrdenPago, "before_insert", generar_id_orden)
