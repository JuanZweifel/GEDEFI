from sqlalchemy import Integer, String, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from app.db import Base
from datetime import datetime, timezone

class DetalleEstadoPartido(Base):
    __tablename__ = "DETALLE_ESTADO_PARTIDO"

    fecha_estado: Mapped[Date] = mapped_column(Date, default=datetime.now(timezone.utc), nullable=False, primary_key=True)
    descripcion_estado: Mapped[str] = mapped_column(String(500), nullable=False)
    id_estado: Mapped[int] = mapped_column(ForeignKey("ESTADO_PARTIDO.id_estado"), nullable=False)
    id_partido: Mapped[int] = mapped_column(ForeignKey("PARTIDO.id_partido"), nullable=False)

    #Relaciones
    partido: Mapped["Partido"] = relationship(
        "Partido",
        back_populates="estados_partido",
        passive_deletes=False
    )

    estado: Mapped["EstadoPartido"] = relationship(
        "EstadoPartido",
        back_populates="detalles_estado",
        passive_deletes=False
    )