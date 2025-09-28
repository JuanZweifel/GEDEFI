from sqlalchemy import String, Integer, DateTime, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from app.db import Base


class PermisoRol(Base):
    __tablename__ = "PERMISO_ROL"

    fecha_ini_permiso_rol: Mapped[datetime] = mapped_column(
        DateTime,
        primary_key=True,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    fecha_fin_permiso_rol: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    id_rol: Mapped[int] = mapped_column(
        ForeignKey("ROL.id_rol"), primary_key=True, nullable=False
    )
    id_permiso: Mapped[int] = mapped_column(
        ForeignKey("PERMISO.id_permiso"), primary_key=True, nullable=False
    )

    # Relaciones
    rol: Mapped["Rol"] = relationship("Rol", back_populates="permisos")
    permiso: Mapped["Permiso"] = relationship("Permiso", back_populates="roles")
