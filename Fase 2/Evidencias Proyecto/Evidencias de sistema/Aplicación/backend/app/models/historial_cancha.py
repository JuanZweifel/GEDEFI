from sqlalchemy import String, Integer, Date, Boolean,DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import date, datetime, timezone
from app.db import Base
from sqlalchemy import ForeignKey

class HistorialCancha(Base):
    __tablename__ = "CANCHA"

    id_cancha: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre_cancha: Mapped[str] = mapped_column (String(50), nullable=False)
    tipo_cancha: Mapped[int] = mapped_column(Integer, nullable=False)
    direccion: Mapped[str] = mapped_column(String(300), nullable=True)
    disponibilidad: Mapped[bool] = mapped_column(Boolean, nullable=False)
    cancha_activa: Mapped[bool] = mapped_column(Boolean, nullable=False)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc), nullable=False)
    fecha_modificacion: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc), nullable=False, onupdate=datetime.now(timezone.utc))
    #modificado_por:Mapped[str] = mapped_column(String, ForeignKey("USUARIO.rut_usuario"), nullable=False)
    fecha_creacion_his:Mapped[date] = mapped_column(Date, nullable=False)

    #Relaciones
