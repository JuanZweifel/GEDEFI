from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import engine, Base
from app.routes import (
    #icha_jugador,
    #cancha,
    #detalle_club_jugador,
    jugador,
    lesion,
    #partido,
    #rendimiento_entrenamiento,
    #rendimiento_partido
)

# WARNING: Recordar comentar la siguiente linea si se quiere mantener las tablas
# Configuracion para desarrollo
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="API GEDEFI", version="1.0")

#app.include_router(cancha.router)
#app.include_router(detalle_club_jugador.router)
app.include_router(jugador.router)
app.include_router(lesion.router)
#app.include_router(partido.router)
#app.include_router(rendimiento_entrenamiento.router)
#app.include_router(rendimiento_partido.router)
#app.include_router(ficha_jugador.router)

# Configurar CORS para permitir el frontend
origins = [
    "http://localhost:8080",  # Puerto del frontend (Desarrollo)
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
