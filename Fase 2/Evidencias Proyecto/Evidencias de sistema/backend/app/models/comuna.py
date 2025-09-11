from sqlalchemy import String, Integer, Date, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.db import Base
from sqlalchemy.orm import relationship
from .region import Region
from sqlalchemy import ForeignKey

class Comuna(Base):
    __tablename__ = "COMUNA"

    id_comuna: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre_comuna: Mapped[str] = mapped_column(String(100), nullable=False)
    id_region: Mapped[int] = mapped_column(Integer, ForeignKey("COMUNA.id_comuna"), nullable=False)

    # Relaciones
    region: Mapped[Region] = relationship(
        Region, back_populates="comunas", cascade="all, delete-orphan"
    )