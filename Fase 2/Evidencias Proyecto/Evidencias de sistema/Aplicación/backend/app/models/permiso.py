from sqlalchemy import ForeignKey
from sqlalchemy import String, Integer, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import date, datetime, timezone
from app.db import Base


class Permiso(Base):
    __tablename__ = "PERMISO"

    id_permiso: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre_permiso: Mapped[str] = mapped_column(String(50), nullable=False)
    descripcion_permiso: Mapped[str] = mapped_column(String(500), nullable=True)
    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now(timezone.utc), nullable=False
    )
    fecha_modificacion: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now(timezone.utc),
        onupdate=datetime.now(timezone.utc),
        nullable=False,
    )

    # Relaciones
    permisos_roles: Mapped["PermisoRol"] = relationship(
        "PermisoRol", back_populates="permiso"
    )
