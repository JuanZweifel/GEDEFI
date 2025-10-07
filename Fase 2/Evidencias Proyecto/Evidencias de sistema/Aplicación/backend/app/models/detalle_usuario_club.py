from sqlalchemy import ForeignKey
from sqlalchemy import Integer, Date, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import date
from app.db import Base


class DetalleUsuarioClub(Base):
    __tablename__ = "DETALLE_USUARIO_CLUB"

    rut_usuario: Mapped[str] = mapped_column(
        String, ForeignKey("USUARIO.rut_usuario"), nullable=False, primary_key=True
    )
    id_club: Mapped[int] = mapped_column(
        Integer, ForeignKey("CLUB.id_club"), nullable=False, primary_key=True
    )
    fecha_ini: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    fecha_fin: Mapped[date] = mapped_column(Date, nullable=True)

    usuario: Mapped["Usuario"] = relationship(
        "Usuario", back_populates="detalles_usuario_club"
    )
    club: Mapped["Club"] = relationship("Club", back_populates="detalles_usuario")

