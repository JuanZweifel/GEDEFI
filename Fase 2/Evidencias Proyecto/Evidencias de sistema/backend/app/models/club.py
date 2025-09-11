from sqlalchemy import ForeignKey
from sqlalchemy import String, Integer, Date
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import date
from app.db import Base


class Club(Base):
    __tablename__ = "CLUB"

    id_club: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre_club: Mapped[str] = mapped_column(String(250), nullable=False, unique=True)
    fecha_fundacion: Mapped[date] = mapped_column(Date, nullable=False)
    mensualidad_activa: Mapped[bool] = mapped_column(Integer, default=True)

    # Relaciones
    ordenes_pago: Mapped[list["OrdenPago"]] = relationship(
        "OrdenPago", back_populates="club", cascade="all, delete-orphan"
    )
    cuentas_usuario: Mapped[list["CuentaUsuario"]] = relationship(
        "CuentaUsuario", back_populates="club", cascade="all, delete-orphan"
    )
    # contratos_club: Mapped[list["ContratoClub"]] = relationship(
    #     "ContratoClub", back_populates="club", cascade="all, delete-orphan"
    # )
