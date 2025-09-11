from sqlalchemy import ForeignKey
from sqlalchemy import String, Integer, Date, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import date
from app.db import Base


class CuentaUsuario(Base):
    __tablename__ = "CUENTA_USUARIO"

    correo_usu: Mapped[str] = mapped_column(String(320), primary_key=True)
    huella_indice_usu: Mapped[str] = mapped_column(String(256), nullable=True)
    huella_pulgar_usu: Mapped[str] = mapped_column(String(256), nullable=True)
    contrasena_usu: Mapped[str] = mapped_column(String(30), nullable=False)
    rol_usu: Mapped[str] = mapped_column(String(30), nullable=False)

    # Claves foraneas
    rut_usu: Mapped[str] = mapped_column(
        String(10), ForeignKey("USUARIO.rut_usu"), nullable=False, unique=True
    )
    id_club: Mapped[int] = mapped_column(
        Integer, ForeignKey("CLUB.id_club"), nullable=False
    )

    # Relaciones
    usuario: Mapped["Usuario"] = relationship(
        "Usuario", back_populates="cuenta_usuario"
    )
    club: Mapped["Club"] = relationship("Club", back_populates="cuentas_usuario")
    asistencias: Mapped[list["AsistenciaReunion"]] = relationship(
        "AsistenciaReunion",
        back_populates="cuenta_usuario",
        cascade="all, delete-orphan",
    )
    historial_permisos: Mapped[list["HistorialPermiso"]] = relationship(
        "HistorialPermiso",
        back_populates="cuenta_usuario",
        cascade="all, delete-orphan",
    )
