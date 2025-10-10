from fastapi import APIRouter, Depends, HTTPException, UploadFile, Form, File
from typing import Optional
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas
import os
import shutil
from datetime import date, datetime

router = APIRouter(prefix="/clubs", tags=["Club"])


@router.post("/")
async def create_club(nombre_club: str = Form(...),
    rut_club: str = Form(...),
    fecha_fundacion: str = Form(...),
    fono_club: str = Form(...),
    direccion_club: str = Form(...),
    email_club: str = Form(...),
    color_primario: str = Form(...),
    color_secundario: str = Form(...),
    color_respaldo: str = Form(None),
    logo_club: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    try:
        club = schemas.ClubCreate(
            nombre_club=nombre_club,
            rut_club=rut_club,
            fecha_fundacion=date.fromisoformat(fecha_fundacion),
            fono_club=fono_club,
            direccion_club=direccion_club,
            email_club=email_club,
            color_primario=color_primario,
            color_secundario=color_secundario,
            color_respaldo=color_respaldo,
            logo_club=None
        )
        # Guardar archivo localmente
        if logo_club and not isinstance(logo_club, str):
            filename = str(logo_club.filename)
            upload_dir = "../images/logos"
            os.makedirs(upload_dir, exist_ok=True)
            file_ext = os.path.splitext(filename)[1]
            file_name = f"{club.nombre_club.replace(' ', '_')}_{int(datetime.utcnow().timestamp())}{file_ext}"
            file_path = os.path.join(upload_dir, file_name).replace("\\", "/")

            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(logo_club.file, buffer)

            club.logo_club = file_path  # reemplazamos con la ruta

        # Llamar al servicio
        club.logo_club = file_path  # asegurar que solo tenga la ruta
        flag = services.create_club(db, club)

        if flag:
            return {"message": "¡Club creado exitosamente!"}
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except TypeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{id_club}", response_model=schemas.ClubRead)
def get_club(id_club: int, db: Session = Depends(get_db)):
    try:
        db_club = services.get_club(db, id_club)
        return db_club
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)


@router.get("/{id_club}/series", response_model=schemas.SerieList)
def get_series_club(id_club: int, db: Session = Depends(get_db)):
    try:
        return services.get_series_club(db, id_club=id_club)
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)


@router.get("/{id_club}/jugadores", response_model=schemas.JugadorList)
def get_players_club(id_club: int, db: Session = Depends(get_db)):
    try:
        return services.get_players_club(db, id_club=id_club)
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)


@router.get("/{id_club}/usuarios", response_model=schemas.UsuarioList)
def get_users_club(id_club: int, db: Session = Depends(get_db)):
    try:
        return services.get_users_club(db, id_club=id_club)
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)


@router.get("/", response_model=list[schemas.ClubWithDetails])
def get_club_with_details(db: Session = Depends(get_db)):
    try:
        return services.get_club_with_details(db)
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)


@router.put("/{id_club}")
def update_club(
    id_club: int,
    nombre_club: str = Form(...),
    rut_club: str = Form(...),
    fecha_fundacion: str = Form(...),
    fono_club: str = Form(...),
    direccion_club: str = Form(...),
    email_club: str = Form(...),
    color_primario: str = Form(...),
    color_secundario: str = Form(...),
    color_respaldo: str = Form(None),
    logo_club: UploadFile = File(None),
    club_activo: bool = Form(...),
    db: Session = Depends(get_db)
):
    try:
        print(logo_club)
        db_club = services.get_club(db, id_club)
        if not db_club: raise HTTPException(status_code=404, detail=f"No se pudo encontrar al club asociado al ID:{id_club}")
        club = schemas.ClubUpdate(
            nombre_club=nombre_club,
            rut_club=rut_club,
            fecha_fundacion=date.fromisoformat(fecha_fundacion),
            fono_club=fono_club,
            direccion_club=direccion_club,
            email_club=email_club,
            color_primario=color_primario,
            color_secundario=color_secundario,
            color_respaldo=color_respaldo,
            logo_club=None,
            club_activo=club_activo
        )
        # Guardar archivo localmente
        if logo_club:
            print("ENTRAMOS")
            filename = str(logo_club.filename)
            upload_dir = "../images/logos"
            os.makedirs(upload_dir, exist_ok=True)
            file_ext = os.path.splitext(filename)[1]
            file_name = f"{club.nombre_club.replace(' ', '_')}_{int(datetime.utcnow().timestamp())}{file_ext}"
            file_path = os.path.join(upload_dir, file_name).replace("\\", "/")

            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(logo_club.file, buffer)

            club.logo_club = file_path  # reemplazamos con la ruta

            # Llamar al servicio
            #club_data = schemas.ClubCreate(**club.model_dump()) #REVISAR
            club.logo_club = file_path  # asegurar que solo tenga la ruta
        elif not logo_club:
            club.logo_club = db_club.logo_club
        else: raise HTTPException(status_code=400, detail=f"Debe enviar un logo valido.")

        if services.update_club(db, id_club, club): return {"message": "¡Club modificado correctamente!"}
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)


@router.delete("/{id_club}")
def delete_club(id_club: int, db: Session = Depends(get_db)):
    try:
        flag = services.delete_club(db, id_club)
        if flag:
            return {"message": "¡Club eliminado correctamente!"}
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
