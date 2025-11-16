from sqlalchemy import Integer, Numeric, String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from app.db import Base


class Fas(Base):
    __tablename__ = "FAS"

    id_fas: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    anio_fas: Mapped[int] = mapped_column(Integer, nullable=False, default=datetime.now(timezone.utc).year, unique=True)  
    monto_inicial: Mapped[int] = mapped_column(Integer, nullable=False)  
    monto_disponible: Mapped[int] = mapped_column(Integer, nullable=False)  
    descripcion: Mapped[str] = mapped_column(String(255), nullable=True)

    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now(timezone.utc), nullable=False
    )
    fecha_modificacion: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now(timezone.utc),
        nullable=False,
        onupdate=datetime.now(timezone.utc),
    )

    # Relación con los usos del fondo
    usos_fas: Mapped[list["UsoFas"]] = relationship("UsoFas", back_populates="fas")