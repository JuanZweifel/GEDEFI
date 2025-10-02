from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import engine, Base
from app.routes import (
    ficha_jugador,
    cancha,
    detalle_club_jugador,
    jugador,
    lesion,
    partido,
    rendimiento_entrenamiento,
    rendimiento_partido,
    club,
    asistencia_reunion,
    reunion,
    serie,
    orden_pago,
    usuario,
    rol,
    archivo,
    auditoria,
    entrenamiento,
    permiso_rol,
    permiso,
    auth,
)

# WARNING: Recordar comentar la siguiente linea si se quiere mantener las tablas
# Configuracion para desarrollo
#Base.metadata.drop_all(bind=engine)
#Base.metadata.create_all(bind=engine)

app = FastAPI(title="API GEDEFI", version="1.0")

app.include_router(permiso.router)
app.include_router(permiso_rol.router)
app.include_router(rol.router)
app.include_router(usuario.router)
app.include_router(archivo.router)
app.include_router(auditoria.router)
app.include_router(entrenamiento.router)
app.include_router(orden_pago.router)
app.include_router(lesion.router)
app.include_router(cancha.router)
app.include_router(detalle_club_jugador.router)
app.include_router(jugador.router)
app.include_router(partido.router)
app.include_router(rendimiento_entrenamiento.router)
app.include_router(rendimiento_partido.router)
app.include_router(ficha_jugador.router)
app.include_router(reunion.router)
app.include_router(asistencia_reunion.router)
app.include_router(club.router)
app.include_router(serie.router)
app.include_router(auth.router)


# Configurar CORS para permitir el frontend
origins = [
    "http://localhost:3000",  # Puerto del frontend (Desarrollo)
    # "https://mi-dominio.com"    # Url en produccion
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api")
def root():
    return {"message": "Hola desde FastAPI 🚀"}
