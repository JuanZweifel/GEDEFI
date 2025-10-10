# limpieza_excel_jugadores.py
from fastapi import APIRouter, UploadFile, File, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from io import BytesIO
import pandas as pd
from datetime import date
from app.db import get_db
from app.models import Jugador, FichaJugador, Serie
from app.utils.validaciones import validar_rut

router = APIRouter()


# ============================================
# 🔧 Función para crear fichas de jugadores
# ============================================
def crear_fichas_jugadores(db: Session, rut_jugadores: list[str], id_serie: int):
    """
    Crea fichas para los jugadores cuyos RUTs están en rut_jugadores y pertenecen a la serie id_serie.
    """
    resultados = []
    print(f"➡️ Creando fichas para {len(rut_jugadores)} jugadores en serie {id_serie}")

    for rut in rut_jugadores:
        print(f"   🔹 Procesando ficha para RUT: {rut}")

        # Verificar si ya existe ficha para ese jugador y serie
        existente = db.query(FichaJugador).filter(
            FichaJugador.rut_jugador == rut,
            FichaJugador.id_serie == id_serie
        ).first()

        if existente:
            print(f"   ⚠️ Ficha ya existente para {rut}")
            resultados.append({"rut": rut, "status": "skip", "reason": "Ficha ya existente"})
            continue

        try:
            ficha = FichaJugador(
                rut_jugador=rut,
                id_serie=id_serie,
                fecha_ini=date.today()
            )
            db.add(ficha)
            resultados.append({"rut": rut, "status": "success"})
            print(f"   ✅ Ficha agregada a la sesión para {rut}")

        except Exception as e:
            print(f"   ❌ Error creando ficha para {rut}: {e}")
            resultados.append({"rut": rut, "status": "error", "reason": str(e)})

    return resultados


# ============================================
# 📤 Endpoint para subir Excel
# ============================================
@router.post("/upload_excel")
async def upload_excel(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        # 📥 Leer archivo Excel
        contents = await file.read()
        df = pd.read_excel(BytesIO(contents), header=2)

        # 🧹 Limpieza básica de columnas
        df = df.drop(df.columns[[0, 1, 9]], axis=1, errors='ignore')
        df.columns = df.columns.str.strip()
        df['CÉDULA DE IDENTIDAD'] = (
            df['CÉDULA DE IDENTIDAD']
            .fillna('')
            .astype(str)
            .str.replace('.', '', regex=False)
            .str.strip()
        )

        nombre_serie = df['NOMBRE DE LA SERIE'].dropna().iloc[0].strip().title()

        results = []
        inserted = 0
        skipped = 0
        seen_ruts = set()
        jugadores_validos = []

        # Buscar serie en BD
        serie_obj = db.query(Serie).filter(Serie.nombre_serie == nombre_serie).first()
        if not serie_obj:
            return JSONResponse(
                content={"message": f"No existe la serie: {nombre_serie}"},
                status_code=400
            )

        print(f"📘 Serie encontrada: {serie_obj.nombre_serie}")

        # Procesar cada fila del Excel
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

            # ✅ Validar RUT
            if not rut:
                errores.append("RUT vacío")
            else:
                try:
                    validar_rut(rut)
                except Exception:
                    errores.append("RUT inválido (formato o dígito verificador incorrecto)")

            # ✅ Validar nombres y apellidos
            if not primer_nombre or len(primer_nombre) < 3:
                errores.append("Primer nombre inválido (min 3 caracteres)")
            elif len(primer_nombre) > 30:
                errores.append("Primer nombre demasiado largo")

            if primer_apellido and len(primer_apellido) < 3:
                errores.append("Primer apellido inválido (min 3 caracteres)")
            elif primer_apellido and len(primer_apellido) > 30:
                errores.append("Primer apellido demasiado largo")

            # ✅ Validar fecha de nacimiento
            fecha_nac = None
            if fecha_raw and not pd.isna(fecha_raw):
                try:
                    fecha_nac = pd.to_datetime(fecha_raw, dayfirst=True).date()
                    if fecha_nac > date.today():
                        errores.append("Fecha de nacimiento futura")
                except Exception:
                    errores.append("Fecha de nacimiento inválida")
            else:
                errores.append("Fecha de nacimiento vacía")

            # ✅ Validar género
            genero_bool = genero.upper() == "MASCULINO" if genero else None
            if genero_bool is None:
                errores.append("Género inválido o vacío")

            # ✅ Evitar duplicados en el archivo
            if rut in seen_ruts:
                errores.append("RUT duplicado en archivo")
            else:
                seen_ruts.add(rut)

            # ✅ Evitar duplicados en BD
            existing = db.query(Jugador).filter(Jugador.rut_jugador == rut).first()
            if existing:
                errores.append("Jugador ya existe en la base de datos")

            # 🚨 Si hay errores, registrar y saltar
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

            # ✅ Crear objeto jugador válido
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

            results.append({
                "status": "success",
                "fila": fila,
                "rut": rut,
                "primer_nombre": primer_nombre,
                "segundo_nombre": segundo_nombre,
                "primer_apellido": primer_apellido,
                "segundo_apellido": segundo_apellido
            })

        # ✅ Insertar todos los jugadores válidos
        db.add_all(jugadores_validos)
        db.commit()
        print(f"✅ {len(jugadores_validos)} jugadores insertados correctamente.")

        # ✅ Crear fichas solo para los jugadores insertados
        rut_insertados = [j.rut_jugador for j in jugadores_validos]
        fichas_resultado = crear_fichas_jugadores(db, rut_insertados, serie_obj.id_serie)
        db.commit()
        print("✅ Commit de fichas realizado correctamente.")

        # ✅ Vincular resultado de fichas al resultado general
        for fr in fichas_resultado:
            for r in results:
                if r['rut'] == fr['rut']:
                    r['ficha_creada'] = fr['status'] == 'success'
                    if 'reason' in fr:
                        r['ficha_error'] = fr['reason']

        return JSONResponse(content={
            "message": "Archivo procesado ✅",
            "insertados": inserted,
            "saltados": skipped,
            "results": results
        })

    except Exception as e:
        db.rollback()
        print("❌ Error general:", str(e))
        import traceback
        traceback.print_exc()
        return JSONResponse(content={"message": f"Error general: {str(e)}"}, status_code=500)