from sqlalchemy import Integer, Date, Boolean, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import date, datetime, timezone
from app.db import Base
from sqlalchemy import ForeignKey

class Partido(Base):
    __tablename__ = "PARTIDO"

    id_partido: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    fecha_partido: Mapped[date] = mapped_column(Date, nullable=False)
    goles_local: Mapped[int] = mapped_column(Integer, nullable=True)
    goles_visita: Mapped[int] = mapped_column(Integer, nullable=True)
    partido_activo: Mapped[bool] = mapped_column(Boolean, nullable=False)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc), nullable=False)
    fecha_modificacion: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc), nullable=False, onupdate=datetime.now(timezone.utc))
    id_cancha:Mapped[int] = mapped_column(Integer, ForeignKey("CANCHA.id_cancha"), nullable=False, index=True)
    #serie_local:Mapped[int] = mapped_column(Integer, ForeignKey("SERIE.id_serie"),  nullable=False, index=True)
    #serie_visita:Mapped[int] = mapped_column(Integer, ForeignKey("SERIE.id_serie"), nullable=False, index=True)
    #modificado_por:Mapped[str] = mapped_column(String, ForeignKey("USUARIO.rut_usuario"), nullable=False)
    fecha_creacion_hist:Mapped[date] = mapped_column(Date, nullable=False)


    #relaciones