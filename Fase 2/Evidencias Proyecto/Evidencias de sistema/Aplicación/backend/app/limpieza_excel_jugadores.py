from fastapi import APIRouter, UploadFile, File, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from io import BytesIO
import pandas as pd
from datetime import date
from app.db import get_db
from app.models import Jugador, FichaJugador, Serie, Usuario
from app.utils.validaciones import validar_rut
# from app.auth import get_current_user  # autenticación

router = APIRouter()


def crear_fichas_jugadores(db: Session, rut_jugadores: list[str], id_serie: int):
    """
    Crea fichas básicas para los jugadores cuyos RUTs están en rut_jugadores,
    pertenecientes a la serie id_serie.
    Los demás campos se inicializan en None.
    """
    resultados = []
    for rut in rut_jugadores:
        existente = db.query(FichaJugador).filter(
            FichaJugador.rut_jugador == rut,
            FichaJugador.id_serie == id_serie
        ).first()

        if existente:
            resultados.append({"rut": rut, "status": "skip", "reason": "Ficha ya existente"})
            continue

        ficha = FichaJugador(
            rut_jugador=rut,
            id_serie=id_serie,
            fecha_ini=date.today(),
            fecha_fin=None,
            talla_camiseta=None,
            talla_short=None,
            talla_media=None,
            talla_botin=None,
            estatura=None,
            Peso=None,
            imc=None
        )

        db.add(ficha)
        resultados.append({"rut": rut, "status": "success"})

    return resultados


@router.post("/upload_excel")
async def upload_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    # current_user: Usuario = Depends(get_current_user)
):
    try:
        # ✅ Simulación de usuario logeado
        id_club = 1

        # Leer archivo Excel
        contents = await file.read()
        df = pd.read_excel(BytesIO(contents), header=2)

        # Limpieza básica de columnas
        df = df.drop(df.columns[[0, 1, 9]], axis=1, errors='ignore')
        df.columns = df.columns.str.strip()
        df['CÉDULA DE IDENTIDAD'] = (
            df['CÉDULA DE IDENTIDAD']
            .fillna('')
            .astype(str)
            .str.replace('.', '', regex=False)
            .str.strip()
        )

        nombre_serie_excel = df['NOMBRE DE LA SERIE'].dropna().iloc[0].strip().title()

        # ✅ Verificar si el club tiene esa serie
        serie_obj = db.query(Serie).filter(
            Serie.nombre_serie == nombre_serie_excel,
            Serie.id_club == id_club
        ).first()
        if not serie_obj:
            return JSONResponse(
                content={"message": f"La serie '{nombre_serie_excel}' no pertenece al club del usuario"},
                status_code=400
            )

        results = []
        inserted = 0
        skipped = 0
        jugadores_validos = []
        seen_ruts = set()

        # Procesar filas del Excel
        for idx, row in df.iterrows():
            fila = idx + 1
            rut = str(row.get('CÉDULA DE IDENTIDAD', '')).strip()
            primer_nombre = str(row.get('PRIMER NOMBRE', '')).strip()
            segundo_nombre = str(row.get('SEGUNDO NOMBRE', '')).strip() or None
            primer_apellido = str(row.get('PRIMER APELLIDO', '')).strip()
            segundo_apellido = str(row.get('SEGUNDO APELLIDO', '')).strip() or None
            genero = str(row.get('GÉNERO', '')).strip()
            fecha_raw = row.get('FECHA DE NACIMIENTO', None)

            errores = []

            # Validaciones
            if not rut:
                errores.append("RUT vacío")
            else:
                try:
                    validar_rut(rut)
                except Exception:
                    errores.append("RUT inválido")

            if not primer_nombre or len(primer_nombre) < 3:
                errores.append("Primer nombre inválido")
            if not primer_apellido or len(primer_apellido) < 3:
                errores.append("Primer apellido inválido")

            fecha_nac = None
            if fecha_raw and not pd.isna(fecha_raw):
                try:
                    fecha_nac = pd.to_datetime(fecha_raw, dayfirst=True).date()
                    if fecha_nac > date.today():
                        errores.append("Fecha futura")
                except Exception:
                    errores.append("Fecha inválida")
            else:
                errores.append("Fecha vacía")

            genero_bool = genero.upper() == "MASCULINO" if genero else None
            if genero_bool is None:
                errores.append("Género inválido")

            # Duplicados en archivo
            if rut in seen_ruts:
                errores.append("RUT duplicado en archivo")
            else:
                seen_ruts.add(rut)

            # Duplicados en BD
            if db.query(Jugador).filter(Jugador.rut_jugador == rut).first():
                errores.append("Jugador ya existe")

            if errores:
                skipped += 1
                results.append({
                    "status": "error",
                    "fila": fila,
                    "rut": rut,
                    "primer_nombre": primer_nombre,
                    "segundo_nombre": segundo_nombre,
                    "primer_apellido": primer_apellido,
                    "segundo_apellido": segundo_apellido,
                    "reason": "; ".join(errores)
                })
                continue

            # Crear jugador válido
            jugador = Jugador(
                rut_jugador=rut,
                primer_nombre=primer_nombre,
                segundo_nombre=segundo_nombre,
                primer_apellido=primer_apellido,
                segundo_apellido=segundo_apellido,
                genero=genero_bool,
                fecha_nacimiento=fecha_nac,
            )
            jugadores_validos.append(jugador)
            inserted += 1
            print("LLEGANDO A LA FILA")
            print(fila)
            results.append({"status": "success", "fila": fila, "rut": rut,
                            "primer_nombre":primer_nombre, "segundo_nombre":segundo_nombre,
                            "primer_apellido":primer_apellido, "segundo_apellido":segundo_apellido})

        # Insertar jugadores
        db.add_all(jugadores_validos)
        db.commit()
        print(f"✅ {len(jugadores_validos)} jugadores insertados correctamente.")

        # Crear fichas para los jugadores insertados
        rut_insertados = [j.rut_jugador for j in jugadores_validos]
        fichas_resultado = crear_fichas_jugadores(db, rut_insertados, serie_obj.id_serie)
        db.commit()
        print("✅ Fichas creadas correctamente.")

        # Totales finales
        total_procesados = len(df)
        total_insertados = inserted
        total_errores = skipped

        return JSONResponse({
            "message": "Archivo procesado ✅",
            "total_procesados": total_procesados,
            "total_insertados": total_insertados,
            "total_errores": total_errores,
            "results": results
        })

    except Exception as e:
        db.rollback()
        print("❌ Error general:", str(e))
        import traceback
        traceback.print_exc()
        return JSONResponse({"message": f"Error general: {str(e)}"}, status_code=500)