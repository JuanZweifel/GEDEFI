import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db import Base, engine, SessionLocal
from app.models import Club, OrdenPago, Reunion
from app.schemas import ClubCreate, OrdenPagoCreate, ReunionCreate
from datetime import date

client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


# -------------------- CLUB --------------------


def test_create_club():
    payload = {
        "nombre_club": "Club Test",
        "fecha_fundacion": "2000-01-01",
        "fono_club": "123456789",
        "direccion_club": "Calle Falsa 123",
        "email_club": "test@club.com",
    }
    response = client.post("/clubs/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["nombre_club"] == payload["nombre_club"]


def test_get_club(db_session):
    club = Club(
        nombre_club="Club Existente",
        fecha_fundacion=date(2000, 1, 1),
        fono_club="123456789",
        direccion_club="Calle Falsa 123",
        email_club="existente@club.com",
    )
    db_session.add(club)
    db_session.commit()
    db_session.refresh(club)

    response = client.get(f"/clubs/{club.id_club}")
    assert response.status_code == 200
    data = response.json()
    assert data["nombre_club"] == "Club Existente"


def test_get_club_no_existe():
    response = client.get("/clubs/9999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Club no encontrado"


# -------------------- ORDEN PAGO --------------------


def test_create_orden_pago(db_session):
    # Primero necesitamos un club para FK
    club = Club(
        nombre_club="Club Pago",
        fecha_fundacion=date(2000, 1, 1),
        fono_club="123456789",
        direccion_club="Calle Falsa 123",
        email_club="pago@club.com",
    )
    db_session.add(club)
    db_session.commit()
    db_session.refresh(club)

    payload = {
        "tipo_orden": 1,
        "tipo_pago": 1,
        "monto": 1000.0,
        "metodo_pago": 1,
        "numero_transaccion": "TX123",
        "descripcion": "Pago test",
        "id_club": club.id_club,
        "usuario_emisor": "USR001",
    }
    response = client.post("/ordenes_pago/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["monto"] == 1000.0


def test_get_orden_pago_no_existe():
    response = client.get("/ordenes_pago/9999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Orden de pago no encontrada"


# -------------------- REUNION --------------------


def test_create_reunion():
    payload = {
        "tipo_reunion": 1,
        "fecha_reunion": "2023-10-10",
        "desc_reunion": "Reunion anual",
    }
    response = client.post("/reuniones/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["desc_reunion"] == "Reunion anual"


def test_get_reunion_no_existe():
    response = client.get("/reuniones/9999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Reunión no encontrada"
