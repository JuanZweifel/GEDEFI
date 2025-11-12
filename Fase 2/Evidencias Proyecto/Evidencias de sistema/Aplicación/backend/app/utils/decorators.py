from functools import wraps
from fastapi import HTTPException, Header, Request
from jose import jwt
from app.schemas import AuditoriaCreate
from app.models import Auditoria

from sqlalchemy.exc import (
    DisconnectionError,
    OperationalError,
    SQLAlchemyError,
    IntegrityError,
)
from sqlalchemy.orm import sessionmaker
import traceback
import re

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
        except SQLAlchemyError as e:
            print(e)
            raise HTTPException(status_code=500, detail="Error interno del servidor")

    return wrapper

MAX_DESCRIPCION = 500
MAX_RECURSO = 100
ALLOWED_ACTIONS = {"CREATE", "UPDATE", "DELETE"}


def _truncate(text: str | None, n: int) -> str:
    """Trunca texto para evitar errores por límite de longitud."""
    if not text:
        return ""
    text = str(text)
    return text if len(text) <= n else text[: n - 3] + "..."


def _extract_id_recurso(obj) -> int | None:
    """
    Busca dinámicamente en cualquier objeto, dict o modelo ORM,
    campos que representen un identificador como id_* o rut_*.
    """
    if obj is None:
        return None

    # Caso: diccionario
    if isinstance(obj, dict):
        for key, val in obj.items():
            if re.match(r"^(id_|rut_)", key) and isinstance(val, (int, str)):
                try:
                    return int(val)
                except Exception:
                    continue
        # fallback genérico
        if "id" in obj and isinstance(obj["id"], (int, str)):
            return int(obj["id"])
        return None

    # Caso: objeto ORM o Pydantic
    attrs = [attr for attr in dir(obj) if not attr.startswith("_")]
    for attr in attrs:
        if re.match(r"^(id_|rut_)", attr):
            val = getattr(obj, attr, None)
            if isinstance(val, (int, str)):
                try:
                    return int(val)
                except Exception:
                    continue
    if hasattr(obj, "id"):
        val = getattr(obj, "id")
        if isinstance(val, (int, str)):
            try:
                return int(val)
            except Exception:
                pass
    return None


def handle_audit(accion_realizada: str, recurso: str):
    """
    Decorador universal para auditar operaciones sobre la base de datos.
    
    Uso:
        @handle_audit("CREATE", "Club")
        def create_club(...): ...
    
    - 'accion_realizada': CREATE | UPDATE | DELETE | READ
    - 'recurso': nombre lógico del recurso (Club, Usuario, Serie, Jugador, etc.)
    """

    accion_realizada = (accion_realizada or "").upper()
    if accion_realizada not in ALLOWED_ACTIONS:
        raise ValueError(f"accion debe ser una de {ALLOWED_ACTIONS}")
    recurso = _truncate(recurso, MAX_RECURSO)

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Buscar Session
            db = kwargs.get("db")
            if db is None:
                for arg in args:
                    if hasattr(arg, "add") and hasattr(arg, "commit"):
                        db = arg
                        break

            # Buscar current_user
            current_user = kwargs.get("current_user", {}) or {}
            if not current_user:
                for arg in args:
                    if isinstance(arg, dict) and any(k in arg for k in ("rut_usuario", "rut", "email", "rol")):
                        current_user = arg
                        break

            # Extraer rut del usuario (string)
            rut_usuario = None
            try:
                if isinstance(current_user, dict):
                    rut_usuario = current_user.get("rut_usuario") or current_user.get("rut")
                else:
                    rut_usuario = getattr(current_user, "rut_usuario", None) or getattr(current_user, "rut", None)

                # Normalizar el RUT (mantiene formato sin puntos, con guion si existe)
                if isinstance(rut_usuario, str):
                    rut_usuario = rut_usuario.strip()
                    rut_usuario = rut_usuario.replace(".", "")
                elif rut_usuario is not None:
                    rut_usuario = str(rut_usuario)

                rut_usuario = rut_usuario if rut_usuario else None
            except Exception:
                print("⚠️ No se pudo extraer rut_usuario desde current_user:", current_user)
                rut_usuario = None

            # Crear sesión separada para la auditoría
            AuditSession = None
            if db is not None:
                try:
                    AuditSession = sessionmaker(bind=db.get_bind())
                except Exception:
                    AuditSession = None

            def save_audit(id_recurso, descripcion, error=False):
                """Guarda registro en la tabla AUDITORIA."""
                if rut_usuario is None:
                    print("⚠️ Auditoría omitida (rut_usuario desconocido)")
                    return

                descripcion = _truncate(descripcion, MAX_DESCRIPCION)
                payload = Auditoria(
                    recurso=recurso,
                    id_recurso=id_recurso,
                    descripcion=descripcion,
                    accion_realizada=accion_realizada,
                    error=error,
                    rut_usuario=rut_usuario,
                )
                if not AuditSession:
                    print("⚠️ No se pudo crear sesión de auditoría:", payload)
                    return
                session = AuditSession()
                try:
                    session.add(payload)
                    session.commit()
                except Exception as e:
                    print("❌ Fallo al guardar auditoría:", e)
                    session.rollback()
                finally:
                    session.close()

            try:
                result = func(*args, **kwargs)

                # Extraer id dinámico y descripción
                id_recurso = None
                descripcion = None

                # Control específico según tipo de resultado y acción
                if isinstance(result, list):
                    # Si es una lista (READ múltiple), dejamos id_recurso como None
                    id_recurso = None
                elif accion_realizada == "DELETE":
                    # Para DELETE, el result es directamente el ID
                    id_recurso = int(result) if result else None
                elif isinstance(result, tuple) and len(result) == 2:
                    # Para tuplas (resultado, descripción)
                    main_result, descripcion = result
                    id_recurso = _extract_id_recurso(main_result) if not isinstance(main_result, list) else None
                    result = main_result
                elif isinstance(result, dict):
                    # Para diccionarios
                    id_recurso = _extract_id_recurso(result)
                    descripcion = result.get("audit_description") or result.get("message")
                else:
                    # Para objetos simples (CREATE/UPDATE)
                    id_recurso = _extract_id_recurso(result)

                # Generar descripción si no existe
                if not descripcion:
                    descripcion = {
                        "CREATE": f"{recurso} creado exitosamente.",
                        "UPDATE": f"{recurso} actualizado correctamente.",
                        "DELETE": f"{recurso} eliminado correctamente.",
                    }.get(accion_realizada, f"Operación sobre {recurso} completada.")

                save_audit(id_recurso, descripcion, error=False)
                return result

            except (DisconnectionError, OperationalError):
                msg = "Error de conexión con la base de datos. Intenta nuevamente más tarde."
                save_audit(None, msg, error=True)
                raise HTTPException(status_code=500, detail=msg)

            except IntegrityError:
                msg = f"Error de integridad en {recurso}. Verifica los datos ingresados."
                save_audit(None, msg, error=True)
                raise HTTPException(status_code=400, detail=msg)

            except HTTPException as e:
                msg = str(e.detail) if getattr(e, "detail", None) else "Error en la operación."
                save_audit(None, msg, error=True)
                raise

            except SQLAlchemyError:
                msg = f"Error interno al procesar {recurso}."
                save_audit(None, msg, error=True)
                raise HTTPException(status_code=500, detail=msg)

            except Exception:
                msg = "Ocurrió un error inesperado. Contacta al administrador."
                save_audit(None, msg, error=True)
                print(traceback.format_exc())
                raise HTTPException(status_code=500, detail=msg)

        return wrapper
    return decorator