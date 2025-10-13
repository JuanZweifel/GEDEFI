from functools import wraps
from fastapi import HTTPException, Header, Request
from sqlalchemy.exc import SQLAlchemyError, DisconnectionError, OperationalError
from jose import jwt


def handle_db_exceptions(func):
    """
    Decorador genérico encargado de la captura y tratamiento de errores genericos de la base de datos.
    El decorador captura los errores de tipo DisconnectionError, OperationalError y SQLAlchemyError 
    que se refieran a errores generales de base de datos, los trata y re-lanza el error como tipo 
    HTTPException, para poder ser manejado a nivel de cliente.
    """
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

