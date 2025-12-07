from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship, Mapped
from datetime import datetime, timedelta
from app.db import Base


class RecuperacionContrasena(Base):
    __tablename__ = "RECUPERACION_CONTRASENA"

    id = Column(Integer, primary_key=True, index=True)
    rut_usuario = Column(String, ForeignKey("USUARIO.rut_usuario"), nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)

    # Relaciones
    usuario: Mapped["Usuario"] = relationship(
        "Usuario", back_populates="tokens_recuperacion"
    )
