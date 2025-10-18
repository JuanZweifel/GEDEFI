from datetime import datetime
from app.db import SessionLocal
from app.models.orden_pago import OrdenPago


def insertar_ordenes_demo():
    db = SessionLocal()
    try:
        ordenes = [
            # 🔹 SEPTIEMBRE 2025
            {"tipo_orden": "Cuota mensual", "tipo_movimiento": "Ingreso", "tipo_pago": "Efectivo", "monto": 85000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 9, 5, 10, 30), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Donación", "tipo_movimiento": "Ingreso", "tipo_pago": "Transferencia", "monto": 250000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 9, 7, 12, 0), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Publicidad", "tipo_movimiento": "Ingreso", "tipo_pago": "Transferencia", "monto": 180000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 9, 10, 18, 30), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Aporte socio", "tipo_movimiento": "Ingreso", "tipo_pago": "Efectivo", "monto": 120000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 9, 12, 9, 0), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Venta productos", "tipo_movimiento": "Ingreso", "tipo_pago": "Efectivo", "monto": 45000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 9, 15, 16, 0), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Inscripción torneo", "tipo_movimiento": "Ingreso", "tipo_pago": "Transferencia", "monto": 60000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 9, 18, 11, 0), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Cuota mensual", "tipo_movimiento": "Ingreso", "tipo_pago": "Transferencia", "monto": 85000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 9, 21, 15, 0), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Donación", "tipo_movimiento": "Ingreso", "tipo_pago": "Transferencia", "monto": 300000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 9, 25, 8, 30), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Venta rifas", "tipo_movimiento": "Ingreso", "tipo_pago": "Efectivo", "monto": 95000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 9, 28, 17, 0), "id_club": 1, "usuario_emisor": "26836282-7"},

            # 🔹 OCTUBRE 2025
            {"tipo_orden": "Cuota mensual", "tipo_movimiento": "Ingreso", "tipo_pago": "Efectivo", "monto": 85000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 10, 2, 9, 30), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Publicidad", "tipo_movimiento": "Ingreso", "tipo_pago": "Transferencia", "monto": 200000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 10, 4, 13, 0), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Venta productos", "tipo_movimiento": "Ingreso", "tipo_pago": "Efectivo", "monto": 65000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 10, 6, 17, 45), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Donación", "tipo_movimiento": "Ingreso", "tipo_pago": "Transferencia", "monto": 280000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 10, 8, 19, 0), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Aporte socio", "tipo_movimiento": "Ingreso", "tipo_pago": "Efectivo", "monto": 110000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 10, 10, 8, 45), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Inscripción torneo", "tipo_movimiento": "Ingreso", "tipo_pago": "Transferencia", "monto": 60000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 10, 12, 12, 15), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Cuota mensual", "tipo_movimiento": "Ingreso", "tipo_pago": "Efectivo", "monto": 85000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 10, 15, 10, 0), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Venta rifas", "tipo_movimiento": "Ingreso", "tipo_pago": "Efectivo", "monto": 120000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 10, 17, 15, 0), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Publicidad", "tipo_movimiento": "Ingreso", "tipo_pago": "Transferencia", "monto": 190000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 10, 20, 9, 30), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Donación", "tipo_movimiento": "Ingreso", "tipo_pago": "Transferencia", "monto": 300000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 10, 22, 18, 0), "id_club": 1, "usuario_emisor": "26836282-7"},
        ]

        for data in ordenes:
            db_orden = OrdenPago(**data)
            db.add(db_orden)
            db.flush()
            db.refresh(db_orden)

        db.commit()
        print("✅ Se insertaron 20 órdenes de pago de prueba correctamente.")
    except Exception as e:
        print("❌ Error al insertar datos:", e)
        db.rollback()
    finally:
        db.close()


def insertar_egresos_demo():
    db = SessionLocal()
    try:
        egresos = [
            # 🔹 SEPTIEMBRE 2025
            {"tipo_orden": "Compra materiales", "tipo_movimiento": "Egreso", "tipo_pago": "Efectivo", "monto": 120000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 9, 2, 10, 30), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Pago servicios", "tipo_movimiento": "Egreso", "tipo_pago": "Transferencia", "monto": 150000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 9, 5, 15, 0), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Arriendo sala", "tipo_movimiento": "Egreso", "tipo_pago": "Transferencia", "monto": 180000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 9, 8, 9, 0), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Compra insumos", "tipo_movimiento": "Egreso", "tipo_pago": "Efectivo", "monto": 95000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 9, 10, 16, 0), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Mantenimiento", "tipo_movimiento": "Egreso", "tipo_pago": "Transferencia", "monto": 70000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 9, 12, 11, 30), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Pago proveedores", "tipo_movimiento": "Egreso", "tipo_pago": "Transferencia", "monto": 120000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 9, 15, 10, 0), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Servicios limpieza", "tipo_movimiento": "Egreso", "tipo_pago": "Efectivo", "monto": 80000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 9, 18, 14, 0), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Pago internet", "tipo_movimiento": "Egreso", "tipo_pago": "Transferencia", "monto": 60000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 9, 20, 9, 30), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Compra uniformes", "tipo_movimiento": "Egreso", "tipo_pago": "Efectivo", "monto": 130000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 9, 22, 17, 0), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Gastos varios", "tipo_movimiento": "Egreso", "tipo_pago": "Efectivo", "monto": 110000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 9, 25, 12, 0), "id_club": 1, "usuario_emisor": "26836282-7"},

            # 🔹 OCTUBRE 2025
            {"tipo_orden": "Compra materiales", "tipo_movimiento": "Egreso", "tipo_pago": "Efectivo", "monto": 100000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 10, 2, 10, 0), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Pago servicios", "tipo_movimiento": "Egreso", "tipo_pago": "Transferencia", "monto": 140000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 10, 5, 11, 0), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Arriendo sala", "tipo_movimiento": "Egreso", "tipo_pago": "Transferencia", "monto": 160000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 10, 7, 9, 0), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Compra insumos", "tipo_movimiento": "Egreso", "tipo_pago": "Efectivo", "monto": 90000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 10, 10, 16, 0), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Mantenimiento", "tipo_movimiento": "Egreso", "tipo_pago": "Transferencia", "monto": 75000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 10, 12, 14, 0), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Pago proveedores", "tipo_movimiento": "Egreso", "tipo_pago": "Transferencia", "monto": 110000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 10, 15, 10, 0), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Servicios limpieza", "tipo_movimiento": "Egreso", "tipo_pago": "Efectivo", "monto": 90000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 10, 17, 14, 0), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Pago internet", "tipo_movimiento": "Egreso", "tipo_pago": "Transferencia", "monto": 65000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 10, 20, 9, 0), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Compra uniformes", "tipo_movimiento": "Egreso", "tipo_pago": "Efectivo", "monto": 120000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 10, 22, 17, 0), "id_club": 1, "usuario_emisor": "26836282-7"},
            {"tipo_orden": "Gastos varios", "tipo_movimiento": "Egreso", "tipo_pago": "Efectivo", "monto": 95000, "orden_paga": True, "orden_activa": True, "fecha_emision": datetime(2025, 10, 25, 12, 0), "id_club": 1, "usuario_emisor": "26836282-7"},
        ]

        for data in egresos:
            db_orden = OrdenPago(**data)
            db.add(db_orden)
            db.flush()
            db.refresh(db_orden)

        db.commit()
        print("✅ Se insertaron 20 egresos de prueba correctamente.")
    except Exception as e:
        print("❌ Error al insertar egresos:", e)
        db.rollback()
    finally:
        db.close()