from sqlalchemy import ForeignKey
from sqlalchemy import String, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from app.db import Base
from .contrato_club import ContratoClub

class Serie(Base):
    __tablename__ = "SERIE"

    id_serie: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre_serie: Mapped[str] = mapped_column(String(100), nullable=False)
    activa: Mapped[bool] = mapped_column(Boolean, default=True)
    id_asociacion: Mapped[int] = mapped_column(Integer, ForeignKey("ASOCIACION.id_asociacion"), nullable=False)
    #id_club: Mapped[int] = mapped_column(Integer, ForeignKey("CLUB.id_club"), nullable=False)

    # Relaciones        
    contratos_club: Mapped[int] = relationship(ContratoClub, back_populates="series", cascade="all, delete-orphan")