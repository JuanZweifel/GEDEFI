from sqlalchemy import ForeignKey
from sqlalchemy import String, Integer, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from app.db import Base
import datetime


class Solicitud(Base):
    __tablename__ = "SOLICITUD"

    id_solicitud: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    usuario_solicitud: Mapped[int] = mapped_column(
        ForeignKey("USUARIO.rut_usuario"), nullable=False
    )
    usuario_respuesta: Mapped[int] = mapped_column(
        ForeignKey("USUARIO.rut_usuario"), nullable=True
    )
    categoria: Mapped[int] = mapped_column(nullable=False)
    descripcion: Mapped[str] = mapped_column(String(500), nullable=True)
    estado: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    respuesta: Mapped[str] = mapped_column(String(500), nullable=True)
    fecha_creacion: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.now, nullable=False
    )
    fecha_modificacion: Mapped[datetime.datetime] = mapped_column(
        DateTime,
        default=datetime.datetime.now,
        onupdate=datetime.datetime.now,
        nullable=False,
    )

    # relaciones
    usuario_soli: Mapped["Usuario"] = relationship(
        "Usuario",
        foreign_keys=[usuario_solicitud],
        back_populates="solicitudes_realizadas",
    )

    usuario_resp: Mapped["Usuario"] = relationship(
        "Usuario",
        foreign_keys=[usuario_respuesta],
        back_populates="solicitudes_respondidas",
    )

