from sqlalchemy import ForeignKey
from sqlalchemy import String, Integer, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import date, datetime, timezone
from app.db import Base


class Archivo(Base):
    __tablename__ = "ARCHIVO"

    id_archivo: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre_archivo: Mapped[str] = mapped_column(String(255), nullable=False)
    estado_archivo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    ruta_archivo: Mapped[str] = mapped_column(String(500), nullable=False)
    tamano_archivo: Mapped[int] = mapped_column(Integer, nullable=False)
    tipo_archivo: Mapped[str] = mapped_column(String(50), nullable=False)
    fecha_carga_archivo: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now(timezone.utc), nullable=False
    )

    # Clave foránea
    id_usuario: Mapped[int] = mapped_column(
        ForeignKey("USUARIO.rut_usuario"), nullable=False
    )

    # Relaciones
    usuario: Mapped["Usuario"] = relationship("Usuario", back_populates="archivos")
