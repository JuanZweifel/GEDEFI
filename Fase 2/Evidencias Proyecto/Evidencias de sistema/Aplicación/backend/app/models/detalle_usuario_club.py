from sqlalchemy import ForeignKey
from sqlalchemy import Integer, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db import Base


class DetalleUsuarioClub(Base):
    __tablename__ = "DETALLE_USUARIO_CLUB"

    rut_usuario: Mapped[str] = mapped_column(
        String, ForeignKey("USUARIO.rut_usuario"), nullable=False, primary_key=True
    )
    id_club: Mapped[int] = mapped_column(
        Integer, ForeignKey("CLUB.id_club"), nullable=False, primary_key=True
    )
    fecha_ini: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.today, primary_key=True
    )
    fecha_fin: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    usuario: Mapped["Usuario"] = relationship(
        "Usuario", back_populates="detalles_usuario_club"
    )
    club: Mapped["Club"] = relationship("Club", back_populates="detalles_usuario")
