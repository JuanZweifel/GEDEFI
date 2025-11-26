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
    calendario,
    solicitud,
    fas,
    uso_fas,
    correos,
    huella,
    reportes,
)
from app.utils.objetos_sql import create_trigger, create_audit_function, create_trigger_serie

from app.utils.ejecutar_sql import (
    insertar_ordenes_egresos_demo,
    insertar_ordenes_ingresos_demo,
    insertar_clubs_demo,
    insertar_jugadores_demo,
    seed_roles,
)


# validacion de tamaño de archivos
MAX_FILE_SIZE_MB = 5
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

app = FastAPI()


# 🧩 Middleware para limitar el tamaño del archivo subido
@app.middleware("http")
async def limit_upload_size(request: Request, call_next):
    content_length = request.headers.get("content-length")

    if content_length and int(content_length) > MAX_FILE_SIZE_BYTES:
        return JSONResponse(
            content={
                "message": f"El archivo excede el tamaño máximo permitido de {MAX_FILE_SIZE_MB} MB."
            },
            status_code=400,
        )

    return await call_next(request)


# ---------------------------------


app = FastAPI(title="API GEDEFI", version="1.0")


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"detail": exc.errors()})


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
app.include_router(calendario.router)
app.include_router(fas.router)
app.include_router(uso_fas.router)
app.include_router(solicitud.router)
app.include_router(correos.router)
app.include_router(huella.router)
app.include_router(reportes.router)

app.mount(
    "/images", StaticFiles(directory="../images"), name="images"
)  # Se debe modificar, esto enruta las imagenes del backend como rutas para el frontend

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
# WARNING: Recordar comentar la siguiente linea si se quiere mantener las tablas
# Configuracion para desarrollo
#Base.metadata.drop_all(bind=engine)
#Base.metadata.create_all(bind=engine)
#@app.on_event("startup")
#def startup_event():
    #    insertar_ordenes_egresos_demo()
    #    insertar_ordenes_ingresos_demo()
    #    insertar_clubs_demo()
#    create_trigger()
    #    insertar_jugadores_demo()
#    create_audit_function()
#    create_trigger_serie()
#    seed_roles()


@app.get("/api")
def root():
    return {"message": "Hola desde FastAPI 🚀"}
