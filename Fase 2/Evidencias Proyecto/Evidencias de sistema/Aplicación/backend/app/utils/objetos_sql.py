from sqlalchemy import text
from app.db import SessionLocal
from app.utils.constantes import lista_tablas_audit


def create_trigger_serie():
    sql = """
    CREATE OR REPLACE FUNCTION desactivar_serie_sin_jugadores()
    RETURNS TRIGGER AS $$
    BEGIN
        IF (
            SELECT COUNT(*) FROM "FICHA_JUGADOR"
            WHERE id_serie = OLD.id_serie
        ) = 0 THEN
            UPDATE "SERIE"
            SET serie_activa = FALSE
            WHERE id_serie = OLD.id_serie;
        END IF;
        RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trigger_desactivar_serie
    AFTER DELETE ON "FICHA_JUGADOR"
    FOR EACH ROW
    EXECUTE FUNCTION desactivar_serie_sin_jugadores();
    """

    with SessionLocal() as db:
        db.execute(text(sql))
        db.commit()

    print("✅ Trigger 'trigger_activar_serie' creado correctamente.")


def create_audit_function():
    function = """
        CREATE OR REPLACE FUNCTION fn_auditoria()
        RETURNS TRIGGER AS $$
        DECLARE
            p_id_col text := TG_ARGV[0];     
            v_id text;
            v_rut_usuario text;
            v_descripcion text;
        BEGIN
            -- Obtener ID según la operación
            IF TG_OP = 'DELETE' THEN
                v_id := (row_to_json(OLD)::json ->> p_id_col);
            ELSE
                v_id := (row_to_json(NEW)::json ->> p_id_col);
            END IF;

            -- RUT del usuario vía variable de sesión
            BEGIN
                v_rut_usuario := current_setting('app.rut_usuario', true);
            EXCEPTION WHEN others THEN
                v_rut_usuario := NULL;
            END;

            -- Descripción automática
            v_descripcion := 
                CASE TG_OP
                    WHEN 'INSERT' THEN 'Registro creado en ' || TG_TABLE_NAME
                    WHEN 'UPDATE' THEN 'Registro actualizado en ' || TG_TABLE_NAME
                    WHEN 'DELETE' THEN 'Registro eliminado de ' || TG_TABLE_NAME
                END;

            -- Insertar en tabla auditoría
            INSERT INTO public."AUDITORIA"(
                recurso,
                id_recurso,
                datos_viejos,
                datos_nuevos,
                descripcion,
                accion_realizada,
                error,
                rut_usuario,
                fecha_cambio
            )
            VALUES (
                TG_TABLE_NAME,
                v_id,
                row_to_json(OLD),
                row_to_json(NEW),
                v_descripcion,
                TG_OP,
                false,
                v_rut_usuario,
                now()
            );

            -- devolver fila
            IF TG_OP = 'DELETE' THEN
                RETURN OLD;
            ELSE
                RETURN NEW;
            END IF;
        END;
        $$ LANGUAGE plpgsql;
    """

    with SessionLocal() as db:
        db.execute(text(function))
        db.commit()


def create_trigger():
    db = SessionLocal()
    try:
        for tabla, pk in lista_tablas_audit.items():

            on_clause = f'public."{tabla}"'
            trigger_name = tabla.lower()

            sql = f"""
            CREATE OR REPLACE TRIGGER trg_{trigger_name}_auditoria
            AFTER INSERT OR UPDATE OR DELETE ON {on_clause}
            FOR EACH ROW
            EXECUTE FUNCTION fn_auditoria('{pk}');
            """
            db.execute(text(sql))
        db.commit()
    finally:
        db.close()


"""
from fastapi import Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

def set_rut(db: Session, rut: str):
    db.execute(text("SELECT set_config('app.rut_usuario', :rut, true)"), {"rut": rut})

# ejemplo de endpoint
@router.post("/clubs")
def crear_club(payload: ClubCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1) setear el rut en la misma sesión/connection
    set_rut(db, current_user.rut)   # <- ESTO es clave y debe ejecutarse antes de las modificaciones

    # 2) ahora hacer la inserción (ORM o SQL)
    nuevo = Club(**payload.dict())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo
"""
