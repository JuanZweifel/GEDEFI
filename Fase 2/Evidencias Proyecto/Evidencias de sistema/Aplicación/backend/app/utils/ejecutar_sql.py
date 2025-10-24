from datetime import datetime, timedelta
from app.db import SessionLocal
from app.models.orden_pago import OrdenPago, EstadoOrdenEnum, TipoPagoEnum, TipoMovimientoEnum


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
