from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import engine, Base
from app.routes import (
    club,
    asistencia_reunion,
    reunion,
    serie,
    orden_pago
)

# WARNING: Recordar comentar la siguiente linea si se quiere mantener las tablas
# Configuracion para desarrollo
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="API GEDEFI", version="1.0")

app.include_router(reunion.router)
app.include_router(asistencia_reunion.router)
app.include_router(club.router)
app.include_router(orden_pago.router)
app.include_router(serie.router)


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
