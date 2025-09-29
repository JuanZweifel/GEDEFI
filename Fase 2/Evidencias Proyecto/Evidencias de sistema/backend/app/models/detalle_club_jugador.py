from sqlalchemy import Date, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from datetime import date
from app.db import Base
from sqlalchemy import ForeignKey


class DetalleClubJugador(Base):
    __tablename__ = "DETALLE_CLUB_JUGADOR"

    fecha_ini: Mapped[date] = mapped_column(Date, primary_key=True, nullable=False)
    fecha_fin: Mapped[date] = mapped_column(Date, nullable=True)
    rut_jugador:Mapped[str] = mapped_column(String(10), ForeignKey("JUGADOR.rut_jugador"), primary_key=True, nullable=False, index=True)
    #id_club:Mapped[int] = mapped_column(Integer, ForeignKey("CLUB.id_club"), primary_key=True, nullable=False, index=True)

    # Relaciones
    jugador: Mapped["Jugador"] = relationship(
        "Jugador", back_populates= "detalles_club_jugador"
    )

    #club: Mapped["Club"] = relationship(
        #"Club", back_populates= "detalle_club_jugador"
    #)