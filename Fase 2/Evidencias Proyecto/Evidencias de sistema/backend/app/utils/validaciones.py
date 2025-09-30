# TODO: Se dejaran las validaciones que se reutilizan en cada uno de los servicios o logica de negocio para optimizacion de codigo
from datetime import date, datetime
import re

# ---------------------------------- VALIDACION DE RUT CHILENO ----------------------------------
def validar_rut(rut: str) -> bool:
    """
    Valida un RUT chileno en formato 12345678-9 o 12345678-K
    """
    try:
        rut = rut.replace(".", "").upper()  # quitar puntos y poner mayúscula a 'K'
        numero, dv = rut.split("-")
        numero = int(numero)

        # Calcular dígito verificador
        suma = 0
        multiplicador = 2
        for digito in reversed(str(numero)):
            suma += int(digito) * multiplicador
            multiplicador = 2 if multiplicador == 7 else multiplicador + 1

        resto = 11 - (suma % 11)
        if resto == 11:
            dv_calculado = "0"
        elif resto == 10:
            dv_calculado = "K"
        else:
            dv_calculado = str(resto)

        if dv_calculado == dv:
            return True
        else:
            raise ValueError("El RUN no es válido.")
    except Exception as e :
        raise e

# prueba individual del metodo     
# print(validar_rut("26836282-7"))  # True
# print(validar_rut("26836282-1"))  # True
# print(validar_rut("18109416-8"))  # False
# print(validar_rut("18109416-2"))  # False


# ----------------------- VALIDACIONES DE NOMBRES Y APELLIDOS -----------------------

import re

def validar_nombre(nombre: str) -> str:
    try:
        """
        Valida y corrige un nombre propio:
        - Elimina espacios en los extremos.
        - Si no empieza con mayúscula, la corrige.
        - No permite números ni caracteres especiales.
        - Devuelve el nombre corregido si es válido, o False si no.
        """
        # Eliminar espacios en los extremos
        nombre = nombre.strip()

        # Verificar que solo contenga letras y espacios (con soporte para acentos y ñ)
        if not re.fullmatch(r"[A-Za-zÁÉÍÓÚáéíóúÑñ ]+", nombre):
            raise ValueError("El nombre contiene caracteres inválidos.")

        # Convertir a formato de nombre propio (cada palabra capitalizada)
        nombre = " ".join(p.capitalize() for p in nombre.split())

        return nombre
    except Exception as e:
        raise e


# Ejemplos de uso
# print(validar_nombre(" juan "))       # "Juan"
# print(validar_nombre("pedro perez"))  # "Pedro Perez"
# print(validar_nombre("MARÍA josé"))   # "María José"
# print(validar_nombre("Carlos123"))    # False
# print(validar_nombre("Ana-Luisa"))    # False


def validar_email(value: str) -> str:
    """
    Valida que el email tenga un formato correcto.
    """
    value = value.strip()
    # Regex básico para email
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    if not re.fullmatch(pattern, value):
        raise ValueError("El email ingresado no es válido")
    return value

def validar_fecha_pasada(value: date | str) -> date:
    """
    Valida que la fecha sea válida y no esté en el futuro.
    """
    # Si viene como string, convertir a date
    if isinstance(value, str):
        try:
            value = datetime.strptime(value, "%Y-%m-%d").date()
        except ValueError:
            raise ValueError("La fecha ingresada no es válida")

    if value > date.today():
        raise ValueError("La fecha no puede ser mayor a la fecha actual")
    return value

# PRUEBAS DE EMAIL Y FECHA
#try:
#    email = validar_email("usuario@example.com")
#    print("Email válido:", email)
#except ValueError as e:
#    print("Error email:", e)

# --- Email inválido ---
#try:
#    email = validar_email("usuario@@example.com")
#    print("Email válido:", email)
#except ValueError as e:
#    print("Error email:", e)

# --- Fecha válida ---
#try:
#    fecha = validar_fecha_pasada("2023-05-20")
#    print("Fecha válida:", fecha)
#except ValueError as e:
#    print("Error fecha:", e)

# --- Fecha inválida (futura) ---
#try:
#    fecha = validar_fecha_pasada("2999-01-01")
#    print("Fecha válida:", fecha)
#except ValueError as e:
#    print("Error fecha:", e)

# --- Fecha inválida (formato incorrecto) ---
#try:
#    fecha = validar_fecha_pasada("20-05-2023")
#    print("Fecha válida:", fecha)
#except ValueError as e:
#    print("Error fecha:", e)