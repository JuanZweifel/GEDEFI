from sqlalchemy import ForeignKey
from sqlalchemy import String, Integer, Date, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import datetime, date, timezone
from app.db import Base


class HistorialClub(Base):
    __tablename__ = "HISTORIAL_CLUB"

    id_club: Mapped[int] = mapped_column(Integer, nullable=False, index=True, primary_key=True)
    nombre_club: Mapped[str] = mapped_column(String(250), nullable=False, unique=True)
    fecha_fundacion: Mapped[date] = mapped_column(Date, nullable=False)
    fono_club: Mapped[str] = mapped_column(String(12), nullable=True)
    direccion_club: Mapped[str] = mapped_column(String(500), nullable=False)
    email_club: Mapped[str] = mapped_column(String(320), nullable=False, unique=True)
    club_activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    fecha_modificacion: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    fecha_creacion_his: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.now(timezone.utc))
    #usuario_modificacion: Mapped[int] = mapped_column(ForeignKey("USUARIO.rut_usuario"), nullable=False, index=True)

    # Relaciones
    #usuario_mod: Mapped["Usuario"] = relationship("Usuario", back_populates="historial_clubs")