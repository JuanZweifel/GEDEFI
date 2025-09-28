from sqlalchemy import ForeignKey
from sqlalchemy import String, Integer, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db import Base


class HistorialSerie(Base):
    __tablename__ = "HISTORIAL_SERIE"

    id_serie: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre_serie: Mapped[str] = mapped_column(String(100), nullable=False)
    serie_activa: Mapped[bool] = mapped_column(Boolean, default=True)
    id_club: Mapped[int] = mapped_column(Integer, nullable=False)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    fecha_modificacion: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    fecha_creacion_his: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.now(timezone.utc))
    usuario_modificacion: Mapped[int] = mapped_column(ForeignKey("USUARIO.rut_usuario"), nullable=False, index=True)

    # Relaciones
    usuario_mod: Mapped["Usuario"] = relationship("Usuario", back_populates="historial_clubs")