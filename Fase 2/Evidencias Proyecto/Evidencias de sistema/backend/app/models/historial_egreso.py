from sqlalchemy import String, Integer, Date
from sqlalchemy.orm import Mapped, mapped_column
from datetime import date
from app.db import Base



class Historial_egreso(Base):
    __tablename__ = "HISTORIAL_EGRESO"

    id_egreso: Mapped[int] = mapped_column(Integer, primary_key=True, index= True)
    fecha_egreso: Mapped[date] = mapped_column (Date, nullable= False)
    monto_egreso: Mapped[int] = mapped_column (Integer, nullable= False)
    tipo_pago_egre: Mapped[int] = mapped_column (Integer, nullable= False)
    descripcion_egreso: Mapped[str] = mapped_column (String, nullable= False)