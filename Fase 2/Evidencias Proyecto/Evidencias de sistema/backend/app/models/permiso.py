from sqlalchemy import ForeignKey
from sqlalchemy import String, Integer, Date
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import date
from app.db import Base


class Permiso(Base):
    __tablename__ = "PERMISO"

    id_permiso: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre_permiso: Mapped[str] = mapped_column(String(30), nullable=False, unique=True)
    descripcion_permiso: Mapped[str] = mapped_column(String(500), nullable=False)

    # Relaciones
    historial_permisos: Mapped[list["HistorialPermiso"]] = relationship(
        "HistorialPermiso", back_populates="permiso", cascade="all, delete-orphan"
    )
