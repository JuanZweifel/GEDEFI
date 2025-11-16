from datetime import datetime, timedelta, date, timezone
from random import randint, choice
from app.db import SessionLocal
from app.models.jugador import Jugador
from app.models.ficha_jugador import FichaJugador
from app.models.detalle_club_jugador import DetalleClubJugador
from app.models.rol import Rol
from app.models.orden_pago import (
    OrdenPago,
    EstadoOrdenEnum,
    TipoPagoEnum,
    TipoMovimientoEnum,
)
from app.models.club import Club
from app.services.serie import create_massive_series


DEFAULT_ROLES = [
    {
        "nombre": "Administrador",
        "descripcion": "Tiene acceso total al sistema. Gestiona usuarios, configuraciones, roles y toda la información del club.",
    },
    {
        "nombre": "Secretario",
        "descripcion": "Encargado de la gestión administrativa: manejo de documentación, registros, asistencia y comunicaciones internas.",
    },
    {
        "nombre": "Tesorero",
        "descripcion": "Responsable de la administración financiera: pagos, ingresos, cuotas, control de presupuesto y reportes económicos.",
    },
    {
        "nombre": "Entrenador",
        "descripcion": "Supervisa y gestiona las actividades deportivas: entrenamientos, evaluaciones, listas de jugadores y rendimiento.",
    },
    {
        "nombre": "Delegado",
        "descripcion": "Actúa como enlace entre jugadores, entrenadores y directiva. Coordina tareas operativas y apoya en eventos o partidos.",
    },
]


def insertar_ordenes_ingresos_demo():
    db = SessionLocal()
    try:
        ordenes_ingreso = [
            {
                "tipo_orden": "Cuota mensual",
                "tipo_movimiento": TipoMovimientoEnum.ingreso,
                "tipo_pago": TipoPagoEnum.efectivo,
                "monto": 85000,
                "metodo_pago": "Caja club",
                "numero_transaccion": None,
                "descripcion": "Pago mensual socio activo",
                "estado_orden": EstadoOrdenEnum.pagada,
                "fecha_emision": datetime(2025, 10, 1, 9, 0),
                "fecha_pago": datetime(2025, 10, 1, 10, 30),
                "fecha_vencimiento": datetime(2025, 10, 30),
                "id_club": 1,
                "usuario_emisor": "26836282-7",
                "usuario_pago": "26833934-5",
            },
            {
                "tipo_orden": "Donación voluntaria",
                "tipo_movimiento": TipoMovimientoEnum.ingreso,
                "tipo_pago": TipoPagoEnum.transferencia,
                "monto": 150000,
                "metodo_pago": "Banco Estado",
                "numero_transaccion": "TRX-20251003-01",
                "descripcion": "Donación anónima para actividades deportivas",
                "estado_orden": EstadoOrdenEnum.pagada,
                "fecha_emision": datetime(2025, 10, 3, 12, 0),
                "fecha_pago": datetime(2025, 10, 3, 13, 0),
                "fecha_vencimiento": None,
                "id_club": 2,
                "usuario_emisor": "26836282-7",
                "usuario_pago": "26216894-8",
            },
            {
                "tipo_orden": "Publicidad evento anual",
                "tipo_movimiento": TipoMovimientoEnum.ingreso,
                "tipo_pago": TipoPagoEnum.transferencia,
                "monto": 250000,
                "metodo_pago": "Banco Chile",
                "numero_transaccion": "TRX-20251005-02",
                "descripcion": "Publicidad de empresa colaboradora",
                "estado_orden": EstadoOrdenEnum.pendiente,
                "fecha_emision": datetime(2025, 10, 5, 15, 30),
                "fecha_vencimiento": datetime(2025, 10, 25),
                "fecha_pago": None,
                "id_club": 1,
                "usuario_emisor": "26836282-7",
                "usuario_pago": None,
            },
            {
                "tipo_orden": "Venta productos deportivos",
                "tipo_movimiento": TipoMovimientoEnum.ingreso,
                "tipo_pago": TipoPagoEnum.efectivo,
                "monto": 70000,
                "metodo_pago": "Kiosko club",
                "numero_transaccion": None,
                "descripcion": "Venta de poleras y gorras oficiales",
                "estado_orden": EstadoOrdenEnum.vencida,
                "fecha_emision": datetime(2025, 9, 25, 17, 0),
                "fecha_vencimiento": datetime(2025, 9, 30),
                "fecha_pago": None,
                "id_club": 1,
                "usuario_emisor": "26836282-7",
                "usuario_pago": None,
            },
            {
                "tipo_orden": "Inscripción torneo regional",
                "tipo_movimiento": TipoMovimientoEnum.ingreso,
                "tipo_pago": TipoPagoEnum.transferencia,
                "monto": 90000,
                "metodo_pago": "Banco BCI",
                "numero_transaccion": "TRX-20250928-05",
                "descripcion": "Cuota de inscripción torneo 2025",
                "estado_orden": EstadoOrdenEnum.anulada,
                "fecha_emision": datetime(2025, 9, 28, 10, 0),
                "fecha_vencimiento": datetime(2025, 10, 5),
                "fecha_pago": None,
                "id_club": 2,
                "usuario_emisor": "26836282-7",
                "usuario_pago": None,
            },
        ]

        for data in ordenes_ingreso:
            db_orden = OrdenPago(**data)
            db.add(db_orden)
            db.flush()
            db.refresh(db_orden)

        db.commit()
        print("✅ Se insertaron órdenes de INGRESO correctamente.")
    except Exception as e:
        print("❌ Error al insertar órdenes de ingreso:", e)
        db.rollback()
    finally:
        db.close()


def insertar_ordenes_egresos_demo():
    db = SessionLocal()
    try:
        ordenes_egreso = [
            {
                "tipo_orden": "Compra de balones",
                "tipo_movimiento": TipoMovimientoEnum.egreso,
                "tipo_pago": TipoPagoEnum.transferencia,
                "monto": 120000,
                "metodo_pago": "Banco Estado",
                "numero_transaccion": "TRX-20251002-03",
                "descripcion": "Compra de balones de fútbol y básquetbol",
                "estado_orden": EstadoOrdenEnum.pagada,
                "fecha_emision": datetime(2025, 10, 2, 9, 0),
                "fecha_pago": datetime(2025, 10, 2, 10, 0),
                "fecha_vencimiento": datetime(2025, 10, 5),
                "id_club": 1,
                "usuario_emisor": "26836282-7",
                "usuario_pago": "26833934-5",
            },
            {
                "tipo_orden": "Pago árbitros torneo",
                "tipo_movimiento": TipoMovimientoEnum.egreso,
                "tipo_pago": TipoPagoEnum.efectivo,
                "monto": 80000,
                "metodo_pago": "Caja club",
                "numero_transaccion": None,
                "descripcion": "Honorarios árbitros evento deportivo",
                "estado_orden": EstadoOrdenEnum.pagada,
                "fecha_emision": datetime(2025, 10, 6, 14, 0),
                "fecha_pago": datetime(2025, 10, 6, 15, 0),
                "fecha_vencimiento": datetime(2025, 10, 10),
                "id_club": 2,
                "usuario_emisor": "26836282-7",
                "usuario_pago": "26216894-8",
            },
            {
                "tipo_orden": "Mantenimiento sede",
                "tipo_movimiento": TipoMovimientoEnum.egreso,
                "tipo_pago": TipoPagoEnum.transferencia,
                "monto": 200000,
                "metodo_pago": "Banco Chile",
                "numero_transaccion": "TRX-20251009-08",
                "descripcion": "Reparación de techumbre y pintura",
                "estado_orden": EstadoOrdenEnum.pendiente,
                "fecha_emision": datetime(2025, 10, 9, 11, 0),
                "fecha_vencimiento": datetime(2025, 10, 25),
                "fecha_pago": None,
                "id_club": 1,
                "usuario_emisor": "26836282-7",
                "usuario_pago": None,
            },
            {
                "tipo_orden": "Compra de uniformes",
                "tipo_movimiento": TipoMovimientoEnum.egreso,
                "tipo_pago": TipoPagoEnum.pago_linea,
                "monto": 350000,
                "metodo_pago": "WebPay",
                "numero_transaccion": "WBP-20251012-04",
                "descripcion": "Pago en línea de uniformes nuevos",
                "estado_orden": EstadoOrdenEnum.pagada,
                "fecha_emision": datetime(2025, 10, 12, 9, 0),
                "fecha_pago": datetime(2025, 10, 12, 9, 15),
                "fecha_vencimiento": datetime(2025, 10, 20),
                "id_club": 2,
                "usuario_emisor": "26836282-7",
                "usuario_pago": "26216894-8",
            },
            {
                "tipo_orden": "Compra implementos gimnasio",
                "tipo_movimiento": TipoMovimientoEnum.egreso,
                "tipo_pago": TipoPagoEnum.transferencia,
                "monto": 270000,
                "metodo_pago": "Banco BCI",
                "numero_transaccion": "TRX-20251014-06",
                "descripcion": "Compra de mancuernas y colchonetas",
                "estado_orden": EstadoOrdenEnum.anulada,
                "fecha_emision": datetime(2025, 10, 14, 16, 0),
                "fecha_vencimiento": datetime(2025, 10, 25),
                "fecha_pago": None,
                "id_club": 1,
                "usuario_emisor": "26836282-7",
                "usuario_pago": None,
            },
        ]

        for data in ordenes_egreso:
            db_orden = OrdenPago(**data)
            db.add(db_orden)
            db.flush()
            db.refresh(db_orden)

        db.commit()
        print("✅ Se insertaron órdenes de EGRESO correctamente.")
    except Exception as e:
        print("❌ Error al insertar órdenes de egreso:", e)
        db.rollback()
    finally:
        db.close()


# Función para generar RUT ficticio válido
def generar_rut_ficticio(index: int) -> str:
    base = 10000000 + index
    suma = 0
    factor = 2
    for c in reversed(str(base)):
        suma += int(c) * factor
        factor += 1
        if factor > 7:
            factor = 2
    dv = 11 - (suma % 11)
    if dv == 11:
        dv = 0
    elif dv == 10:
        dv = "K"
    return f"{base}-{dv}"


def insertar_clubs_demo():
    db = SessionLocal()
    try:
        logo = "../images/logos/Angamos_Fc_1761257118.jpg"
        color_primario = "#000000"
        color_secundario = "#000000"
        color_respaldo = None
        fecha_fundacion = date(2025, 10, 1)

        NUMEROS_EN_TEXTO = [
            "uno",
            "dos",
            "tres",
            "cuatro",
            "cinco",
            "seis",
            "siete",
            "ocho",
            "nueve",
            "diez",
            "once",
            "doce",
            "trece",
            "catorce",
            "quince",
            "dieciséis",
            "diecisiete",
            "dieciocho",
            "diecinueve",
            "veinte",
            "veintiuno",
            "veintidós",
            "veintitrés",
            "veinticuatro",
            "veinticinco",
            "veintiséis",
            "veintisiete",
            "veintiocho",
            "veintinueve",
            "treinta",
            "treinta y uno",
            "treinta y dos",
            "treinta y tres",
            "treinta y cuatro",
            "treinta y cinco",
            "treinta y seis",
            "treinta y siete",
            "treinta y ocho",
            "treinta y nueve",
            "cuarenta",
        ]

        for i in range(1, 41):
            rut = generar_rut_ficticio(i)
            nombre = f"Club Demo {NUMEROS_EN_TEXTO[i-1]}"
            telefono = f"9{10000000 + i}"
            direccion = f"Demo # {i}"
            email = f"club{i}@deportes.com"

            club = Club(
                rut_club=rut,
                nombre_club=nombre,
                fecha_fundacion=fecha_fundacion,
                fono_club=telefono,
                direccion_club=direccion,
                email_club=email,
                logo_club=logo,
                color_primario=color_primario,
                color_secundario=color_secundario,
                color_respaldo=color_respaldo,
                club_activo=True,
            )

            db.add(club)
            db.flush()
            db.refresh(club)

            # Crear series para el club
            create_massive_series(db, club.id_club, current_user={"admin": True})

        db.commit()
        print("✅ Se insertaron 40 clubs con sus series correctamente.")
    except Exception as e:
        print("❌ Error al insertar clubs:", e)
        db.rollback()
    finally:
        db.close()


# Listas de nombres y apellidos para síntesis
PRIMEROS_NOMBRES = [
    "Juan",
    "Pedro",
    "Luis",
    "Carlos",
    "Diego",
    "Matías",
    "Andrés",
    "Jorge",
    "Fernando",
    "Ricardo",
]
SEGUNDOS_NOMBRES = [
    "Ignacio",
    "Alberto",
    "Sebastián",
    "Emiliano",
    "Martín",
    "Alejandro",
    None,
    None,
]
APELLIDOS = [
    "González",
    "Pérez",
    "Ramírez",
    "Soto",
    "Rojas",
    "Fernández",
    "Morales",
    "Vega",
    "Torres",
    "Molina",
]


def insertar_jugadores_demo():
    db = SessionLocal()
    try:
        jugadores_info = [
            # id_serie, id_club, cantidad de jugadores
            (14, 2, 10),
            (4, 1, 10),
        ]

        for id_serie, id_club, cantidad in jugadores_info:
            for i in range(1, cantidad + 1):
                rut = generar_rut_ficticio(randint(1, 9999999))
                primer_nombre = choice(PRIMEROS_NOMBRES)
                segundo_nombre = choice(SEGUNDOS_NOMBRES)
                primer_apellido = choice(APELLIDOS)
                segundo_apellido = choice(APELLIDOS)
                genero = choice([True, False])
                fecha_nacimiento = date(
                    2000 + randint(0, 5), randint(1, 12), randint(1, 28)
                )
                fono_jugador = f"9{randint(10000000, 99999999)}"

                # Crear Jugador
                jugador = Jugador(
                    rut_jugador=rut,
                    primer_nombre=primer_nombre,
                    segundo_nombre=segundo_nombre,
                    primer_apellido=primer_apellido,
                    segundo_apellido=segundo_apellido,
                    genero=genero,
                    fecha_nacimiento=fecha_nacimiento,
                    enfermedades_cronicas="Sin enfermedades crónicas",
                    fono_jugador=fono_jugador,
                    jugador_activo=True,
                )
                db.add(jugador)
                db.flush()
                db.refresh(jugador)

                # Crear FichaJugador
                fecha_ini = date(2025, 1, 1)
                ficha = FichaJugador(
                    rut_jugador=jugador.rut_jugador,
                    id_serie=id_serie,
                    fecha_ini=fecha_ini,
                    fecha_fin=None,
                    talla_camiseta=str(randint(1, 3)),
                    talla_short=str(randint(1, 3)),
                    talla_media=str(randint(36, 44)),
                    talla_botin=str(randint(36, 44)),
                    estatura=randint(160, 200),
                    Peso=randint(55, 100),
                    imc=randint(18, 30),
                )
                db.add(ficha)
                db.flush()
                db.refresh(ficha)

                # Crear DetalleClubJugador
                detalle = DetalleClubJugador(
                    rut_jugador=jugador.rut_jugador,
                    id_club=id_club,
                    fecha_ini=fecha_ini,
                    fecha_fin=None,
                )
                db.add(detalle)
                db.flush()
                db.refresh(detalle)

        db.commit()
        print("✅ Se insertaron jugadores, fichas y detalles de club correctamente.")
    except Exception as e:
        print("❌ Error al insertar jugadores:", e)
        db.rollback()
    finally:
        db.close()


def seed_roles():
    db = SessionLocal()
    try:
        for rol in DEFAULT_ROLES:
            exists = db.query(Rol).filter(Rol.nombre_rol == rol["nombre"]).first()
            if not exists:
                db_rol = Rol(nombre_rol=rol["nombre"], desc_rol=rol["descripcion"])
                db.add(db_rol)
        db.commit()
    finally:
        db.close()

