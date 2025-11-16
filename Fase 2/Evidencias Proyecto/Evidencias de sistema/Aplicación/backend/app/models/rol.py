from sqlalchemy import ForeignKey
from sqlalchemy import String, Integer, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from app.db import Base
import datetime


class Rol(Base):
    __tablename__ = "ROL"

    id_rol: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre_rol: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    desc_rol: Mapped[str] = mapped_column(String(500), nullable=True)
    rol_activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    fecha_creacion: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.now, nullable=False
    )
    fecha_modificacion: Mapped[datetime.datetime] = mapped_column(
        DateTime,
        default=datetime.datetime.now,
        onupdate=datetime.datetime.now,
        nullable=False,
    )

    # Relaciones
    usuarios: Mapped[list["Usuario"]] = relationship(
        "Usuario", back_populates="rol", passive_deletes=False
    )
    permisos_roles: Mapped[list["PermisoRol"]] = relationship(
        "PermisoRol", back_populates="rol", passive_deletes=False
    )
