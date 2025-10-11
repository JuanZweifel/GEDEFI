from functools import wraps
from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError, DisconnectionError, OperationalError


def handle_db_exceptions(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except (DisconnectionError, OperationalError):
            raise HTTPException(
                status_code=500, detail="Problemas de conexión con la base de datos."
            )
        except SQLAlchemyError:
            raise HTTPException(status_code=500, detail="Error interno del servidor")

    return wrapper
