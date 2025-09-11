from sqlalchemy import ForeignKey
from sqlalchemy import String, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db import Base


class HistorialPermiso(Base):
    __tablename__ = "HISTORIAL_PERMISO"

    fecha_ini_permiso: Mapped[datetime] = mapped_column(DateTime, primary_key=True)
    fecha_fin_permiso: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    # Claves foraneas
    id_permiso: Mapped[int] = mapped_column(
        Integer, ForeignKey("PERMISO.id_permiso"), primary_key=True
    )
    correo_usu: Mapped[str] = mapped_column(
        String(320), ForeignKey("CUENTA_USUARIO.correo_usu"), primary_key=True
    )

    # Relaciones
    permiso: Mapped["Permiso"] = relationship(
        "Permiso", back_populates="historial_permisos"
    )
    cuenta_usuario: Mapped["CuentaUsuario"] = relationship(
        "CuentaUsuario", back_populates="historial_permisos"
    )
