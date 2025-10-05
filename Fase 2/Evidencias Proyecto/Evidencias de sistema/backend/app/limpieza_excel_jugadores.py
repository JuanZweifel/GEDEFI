# limpieza_excel_jugadores.py
from fastapi import APIRouter, UploadFile, File, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from io import BytesIO
import pandas as pd
from datetime import datetime
from app.db import get_db
from app.models.jugador import Jugador

router = APIRouter()

@router.post("/upload_excel")
async def upload_excel(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        # Leer archivo Excel
        contents = await file.read()
        df = pd.read_excel(BytesIO(contents), header=2)

        # Limpieza básica de columnas
        df = df.drop(df.columns[[0, 1]], axis=1, errors='ignore')
        df.columns = df.columns.str.strip()
        df['CÉDULA DE IDENTIDAD'] = df['CÉDULA DE IDENTIDAD'].fillna('').astype(str).str.replace('.', '', regex=False)

        # Eliminar filas con RUT vacío y duplicados dentro del Excel
        df = df[df['CÉDULA DE IDENTIDAD'] != '']
        df = df.drop_duplicates(subset=['CÉDULA DE IDENTIDAD'])

        inserted = 0
        skipped = 0
        errores = []
        seen_ruts = set()  # Para controlar duplicados internos

        for idx, row in df.iterrows():
            try:
                rut = str(row.get('CÉDULA DE IDENTIDAD', '')).strip()
                if not rut or rut in seen_ruts:
                    skipped += 1
                    continue
                seen_ruts.add(rut)

                # Verificar si ya existe en la base de datos
                existing = db.query(Jugador).filter(Jugador.rut_jugador == rut).first()
                if existing:
                    skipped += 1
                    continue

                # Convertir género a boolean
                genero_bool = str(row.get('GÉNERO', '')).upper() == 'MASCULINO'

                # Convertir fecha de nacimiento
                fecha_raw = row.get('FECHA DE NACIMIENTO', None)
                if pd.isna(fecha_raw):
                    fecha_nac = None
                else:
                    try:
                        fecha_nac = pd.to_datetime(fecha_raw, dayfirst=True).date()
                    except Exception as e_fecha:
                        raise ValueError(f"Error convirtiendo fecha '{fecha_raw}': {e_fecha}")

                # Crear jugador
                jugador = Jugador(
                    rut_jugador=rut,
                    primer_nombre=str(row.get('PRIMER NOMBRE', '')).strip(),
                    segundo_nombre=str(row.get('SEGUNDO NOMBRE', '')).strip() or None,
                    primer_apellido=str(row.get('PRIMER APELLIDO', '')).strip(),
                    segundo_apellido=str(row.get('SEGUNDO APELLIDO', '')).strip() or None,
                    genero=genero_bool,
                    fecha_nacimiento=fecha_nac,
                )

                db.add(jugador)
                inserted += 1

            except Exception as e:
                errores.append({"fila": idx + 1, "error": str(e)})
                print(f"❌ Error fila {idx+1}: {e}")

        db.commit()
        print(f"✅ Se insertaron {inserted} jugadores, se saltaron {skipped}, errores: {len(errores)}")
        return JSONResponse(content={
            "message": "Archivo procesado ✅",
            "insertados": inserted,
            "saltados": skipped,
            "errores": errores
        })

    except Exception as e:
        db.rollback()
        print(f"❌ Error general: {e}")
        return JSONResponse(content={"message": f"Error general: {str(e)}"}, status_code=500)