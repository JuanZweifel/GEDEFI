from sqlalchemy import ForeignKey
from sqlalchemy import Integer, Date
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import date
from app.db import Base

class DetalleUsuarioClub(Base):
    __tablename__ = "DETALLE_USUARIO_CLUB"

    usuario_id: Mapped[int] = mapped_column(Integer, ForeignKey("USUARIO.id"), nullable=False, primary_key=True)
    club_id: Mapped[int] = mapped_column(Integer, ForeignKey("CLUB.id"), nullable=False, primary_key=True)
    fecha_ini: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    fecha_fin: Mapped[date] = mapped_column(Date, nullable=True)

    usuario = relationship("Usuario", back_populates="detalles_club")
    club = relationship("Club", back_populates="detalles_usuario")