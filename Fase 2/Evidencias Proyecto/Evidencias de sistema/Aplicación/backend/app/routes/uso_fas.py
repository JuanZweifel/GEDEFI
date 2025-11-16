from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import services, schemas
from app.models import DetalleClubJugador, UsoFas, Fas, Jugador, Club
from app.security import get_current_user

router = APIRouter(prefix="/uso_fas", tags=["Usos del Fondo FAS"])


@router.get("/publico", response_model=list[dict])
def get_fas_usos_publico(db: Session = Depends(get_db)):
    """
    Endpoint público: devuelve resumen de usos del FAS agrupados por club.
    Cada entrada contiene el nombre del club, cantidad de personas y monto total utilizado.
    """
    from sqlalchemy import func
    from app.models import UsoFas, DetalleClubJugador, Club

    resultados = (
        db.query(
            Club.nombre_club.label("club"),
            func.count(UsoFas.rut_jugador.distinct()).label("personas"),
            func.sum(UsoFas.monto_usado).label("monto")
        )
        .join(DetalleClubJugador, DetalleClubJugador.rut_jugador == UsoFas.rut_jugador)
        .join(Club, Club.id_club == DetalleClubJugador.id_club)
        .group_by(Club.nombre_club)
        .order_by(func.sum(UsoFas.monto_usado).desc())
        .all()
    )

    # Convertir resultados a lista de diccionarios
    return [
        {"club": r.club, "personas": r.personas, "monto": r.monto or 0}
        for r in resultados
    ]


@router.post("/", response_model=schemas.UsoFasRead)
def create_uso_fas(
    uso_fas: schemas.UsoFasCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Registra un nuevo uso del fondo FAS.
    Solo administradores pueden registrar usos del FAS.
    """

    # Validar que sea administrador (asociación)
    if not current_user.get("asociacion", False):
        raise HTTPException(
            status_code=403,
            detail="Solo administradores pueden registrar usos del FAS.",
        )

    # Obtener el FAS asociado
    fas = db.query(Fas).filter(Fas.id_fas == uso_fas.id_fas).first()
    if not fas:
        raise HTTPException(status_code=404, detail="El fondo FAS no existe.")

    # Validar monto disponible
    if uso_fas.monto_usado > fas.monto_disponible:
        raise HTTPException(
            status_code=400,
            detail=f"El monto utilizado excede el monto disponible (${fas.monto_disponible})."
        )

    # Crear el uso
    nuevo_uso = services.create_uso_fas(db, uso_fas)
    return nuevo_uso


@router.get("/", response_model=list[schemas.UsoFasWithDetails])
def read_usos_fas(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Lista los usos del FAS.
    - Si el usuario pertenece a un club, solo se muestran los usos de jugadores de ese club.
    - Si el usuario no tiene club (administrador/asociación), se muestran todos los usos.
    """

    # BASE QUERY con JOINs a jugador, detalle club y club
    query = (
        db.query(UsoFas, Jugador, DetalleClubJugador, Club)
        .join(Jugador, Jugador.rut_jugador == UsoFas.rut_jugador)
        .join(DetalleClubJugador, DetalleClubJugador.rut_jugador == Jugador.rut_jugador)
        .join(Club, Club.id_club == DetalleClubJugador.id_club)
    )

    # 🔹 CASO 1 — Usuario SIN club → ver todo
    if not current_user.get("id_club"):
        resultados = query.offset(skip).limit(limit).all()

    else:
        # 🔹 CASO 2 — Usuario CON club → filtrar por jugadores de ese club
        resultados = (
            query.filter(DetalleClubJugador.id_club == current_user["id_club"])
                .offset(skip)
                .limit(limit)
                .all()
        )

    usos_con_detalles = []

    for uso, jugador, detalle, club in resultados:

        # ✔ Construcción segura del nombre completo
        nombre_completo = " ".join(filter(None, [
            jugador.primer_nombre,
            jugador.segundo_nombre,
            jugador.primer_apellido,
            jugador.segundo_apellido
        ]))

        usos_con_detalles.append(
            schemas.UsoFasWithDetails(
                id_uso_fas=uso.id_uso_fas,
                id_fas=uso.id_fas,
                rut_jugador=uso.rut_jugador,
                jugador_nombre=nombre_completo,
                club_nombre=club.nombre_club,  # ✔ Nombre correcto del club
                monto_usado=uso.monto_usado,
                descripcion_gasto=uso.descripcion_gasto,
                fecha_uso=uso.fecha_uso,
                fecha_creacion=uso.fecha_creacion,
                fecha_modificacion=uso.fecha_modificacion,
            )
        )

    return usos_con_detalles


@router.put("/{id_uso_fas}", response_model=schemas.UsoFasRead)
def update_uso_fas(
    id_uso_fas: int,
    uso_update: schemas.UsoFasUpdate,
    db: Session = Depends(get_db),
):
    """
    Actualiza un registro de uso del fondo FAS.
    """
    db_uso = services.update_uso_fas(db, id_uso_fas, uso_update)
    if not db_uso:
        raise HTTPException(status_code=404, detail="Uso FAS no encontrado")
    return db_uso


@router.delete("/{id_uso_fas}", status_code=204)
def delete_uso_fas(id_uso_fas: int, db: Session = Depends(get_db)):
    """
    Elimina un uso del fondo FAS y devuelve el monto al fondo.
    """
    deleted = services.delete_uso_fas(db, id_uso_fas)
    if not deleted:
        raise HTTPException(status_code=404, detail="Uso FAS no encontrado")