from sqlalchemy import String, Integer, Date
from sqlalchemy.orm import Mapped, mapped_column
from datetime import date
from app.db import Base



class Historial_ingreso(Base):
    __tablename__ = "HISTORIAL_INGRESO"

    id_ingreso: Mapped[int] = mapped_column(Integer, primary_key=True, index= True)
    id_orden: Mapped[int] = mapped_column (Integer, nullable= True)
    fecha_ingreso: Mapped[date] = mapped_column (Date, nullable= False)
    monto_ingreso: Mapped[int] = mapped_column (Integer, nullable= False)
    tipo_pago_ingre: Mapped[int] = mapped_column (Integer, nullable= False)
    descripcion_ingreso: Mapped[str] = mapped_column (String, nullable= False)