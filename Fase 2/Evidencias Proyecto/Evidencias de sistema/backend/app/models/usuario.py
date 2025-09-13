from sqlalchemy import ForeignKey
from sqlalchemy import String, Integer, Date, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import date
from app.db import Base


class Usuario(Base):
    __tablename__ = "USUARIO"

    rut_usu: Mapped[str] = mapped_column(String(10), primary_key=True)
    primer_nombre_usu: Mapped[str] = mapped_column(String(12), nullable=False)
    segundo_nombre_usu: Mapped[str] = mapped_column(String(12), nullable=True)
    primer_apellido_usu: Mapped[str] = mapped_column(String(12), nullable=False)
    segundo_apellido_usu: Mapped[str] = mapped_column(String(12), nullable=True)
    fecha_nacimiento_usu: Mapped[date] = mapped_column(Date, nullable=False)

    # TODO: Agregar estos campos si es necesario
    # telefono_usu: Mapped[str] = mapped_column(String(15), nullable=False)
    # direccion_usu: Mapped[str] = mapped_column(String(100), nullable=False)

    # Posiblemente estos campos van a venir de una tabla aparte
    # comuna_usu: Mapped[str] = mapped_column(String(50), nullable=False)
    # ciudad_usu: Mapped[str] = mapped_column(String(50), nullable=False)
    # pais_usu: Mapped[str] = mapped_column(String(50), nullable=False)

    # Relaciones
    cuentas_usuario: Mapped[list["CuentaUsuario"]] = relationship(
        "CuentaUsuario", back_populates="usuario"
    )
