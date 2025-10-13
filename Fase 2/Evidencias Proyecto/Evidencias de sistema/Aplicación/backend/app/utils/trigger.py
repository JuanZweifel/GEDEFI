from sqlalchemy import text
from app.db import SessionLocal


def create_trigger():
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
