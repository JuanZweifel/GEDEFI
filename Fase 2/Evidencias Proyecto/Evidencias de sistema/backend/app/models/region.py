from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.db import Base
from sqlalchemy.orm import relationship
from .comuna import Comuna

class Region(Base):
    __tablename__ = "REGION"

    id_region: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre_region: Mapped[str] = mapped_column(String(100), nullable=False)

    # Relaciones 
    comunas: Mapped[list[Comuna]] = relationship(
        "Comuna", back_populates="region", cascade="all, delete-orphan"
    )