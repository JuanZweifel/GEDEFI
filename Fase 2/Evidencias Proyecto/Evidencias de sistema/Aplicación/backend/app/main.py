from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from app.db import engine, Base
from app import limpieza_excel_jugadores
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
from app.utils.trigger import create_trigger
from app.utils.ejecutar_sql import insertar_ordenes_demo, insertar_egresos_demo

# WARNING: Recordar comentar la siguiente linea si se quiere mantener las tablas
# Configuracion para desarrollo
#Base.metadata.drop_all(bind=engine)
#Base.metadata.create_all(bind=engine)

app = FastAPI(title="API GEDEFI", version="1.0")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print("Error de validación:", exc.errors())
    print("Body recibido:", await request.body())
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()}
    )

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
app.include_router(limpieza_excel_jugadores.router)

app.mount("/images", StaticFiles(directory="../images"), name="images") # Se debe modificar, esto enruta las imagenes del backend como rutas para el frontend

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

# TODO: CREACIÓN DE TRIGGER, SE DEBE DESCOMENTAR JUNTO A LA ELIMINACION DE TODO EN LA BASE DE DATOS, WARNING DE ARRIBA
#@app.on_event("startup")
#def startup_event():
#    insertar_egresos_demo()
#    insertar_ordenes_demo()
#    create_trigger()

@app.get("/api")
def root():
    return {"message": "Hola desde FastAPI 🚀"}
