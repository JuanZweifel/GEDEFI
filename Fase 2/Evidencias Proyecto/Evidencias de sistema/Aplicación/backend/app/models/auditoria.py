from sqlalchemy import ForeignKey
from sqlalchemy import String, Integer, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import date, datetime, timezone
from app.db import Base



class Auditoria(Base):
    __tablename__ = "AUDITORIA"

    id_auditoria: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    recurso: Mapped[str] = mapped_column(String(100), nullable=False)
    # TODO: Hablar a que se refiere este id
    id_recurso: Mapped[str] = mapped_column(String(20), nullable=True)
    datos_viejos: Mapped[str] = mapped_column(String(500), nullable=True)
    datos_nuevos: Mapped[str] = mapped_column(String(500), nullable=True)
    descripcion: Mapped[str] = mapped_column(String(500), nullable=True)
    fecha_cambio: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now(timezone.utc), nullable=False
    )
    accion_realizada: Mapped[str] = mapped_column(String(200), nullable=False)
    error: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    rut_usuario: Mapped[str] = mapped_column(
        ForeignKey("USUARIO.rut_usuario"), nullable=False
    )

    # Relaciones
    usuario: Mapped["Usuario"] = relationship("Usuario", back_populates="auditorias")

