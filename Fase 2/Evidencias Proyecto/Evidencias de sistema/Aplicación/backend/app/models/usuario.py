from sqlalchemy import ForeignKey
from sqlalchemy import String, Integer, Boolean, DateTime, Date
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from app.db import Base
from datetime import datetime, date


class Usuario(Base):
    __tablename__ = "USUARIO"

    rut_usuario: Mapped[str] = mapped_column(String(10), primary_key=True)
    email_usuario: Mapped[str] = mapped_column(String(320), unique=True, nullable=False)
    pass_usuario: Mapped[str] = mapped_column(String(300), nullable=False)
    nombre_usuario: Mapped[str] = mapped_column(String(50), nullable=False)
    apellido_usuario: Mapped[str] = mapped_column(String(50), nullable=False)
    fecha_nacimiento: Mapped[date] = mapped_column(Date, nullable=False)
    huella_pulgar: Mapped[str] = mapped_column(String(256), nullable=True)
    huella_indice: Mapped[str] = mapped_column(String(256), nullable=True)
    usuario_activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now(), nullable=False
    )
    fecha_modificacion: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now(),
        onupdate=datetime.now(),
        nullable=False,
    )

    # Claves foráneas
    id_rol: Mapped[int] = mapped_column(ForeignKey("ROL.id_rol"), nullable=False)

    # Relaciones
    rol: Mapped["Rol"] = relationship("Rol", back_populates="usuarios")
    entrenamientos: Mapped[list["Entrenamiento"]] = relationship(
        "Entrenamiento", back_populates="usuario", passive_deletes=False
    )
    archivos: Mapped[list["Archivo"]] = relationship(
        "Archivo", back_populates="usuario", passive_deletes=False
    )
    auditorias: Mapped[list["Auditoria"]] = relationship(
        "Auditoria", back_populates="usuario", passive_deletes=False
    )

    detalles_reunion: Mapped[list["DetalleReunion"]] = relationship(
        "DetalleReunion", back_populates="usuario", passive_deletes=False
    )
    solicitudes_realizadas: Mapped[list["Solicitud"]] = relationship(
        "Solicitud",
        back_populates="usuario_soli",
        foreign_keys="[Solicitud.usuario_solicitud]",
        passive_deletes=False,
    )

    solicitudes_respondidas: Mapped[list["Solicitud"]] = relationship(
        "Solicitud",
        back_populates="usuario_resp",
        foreign_keys="[Solicitud.usuario_respuesta]",
        passive_deletes=False,
    )
    detalles_usuario_club: Mapped[list["DetalleUsuarioClub"]] = relationship(
        "DetalleUsuarioClub", back_populates="usuario", passive_deletes=False
    )
    ordenes_emitidas: Mapped[list["OrdenPago"]] = relationship(
        "OrdenPago",
        back_populates="emisor",
        foreign_keys="[OrdenPago.usuario_emisor]",
        passive_deletes=False,
    )

    ordenes_pagadas: Mapped[list["OrdenPago"]] = relationship(
        "OrdenPago",
        back_populates="pagador",
        foreign_keys="[OrdenPago.usuario_pago]",
        passive_deletes=False,
    )

    tokens_recuperacion: Mapped[list["RecuperacionContrasena"]] = relationship(
        "RecuperacionContrasena", back_populates="usuario"
    )
    # TODO: Agregar relaciones con Historiales
