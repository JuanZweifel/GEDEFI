import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db import Base, engine, SessionLocal
from app.models.reunion import Reunion

client = TestClient(app)


@pytest.fixture(autouse=True)
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


def test_get_reunion():
    # Creacion de registro reunion
    db = SessionLocal()

    nuevo_reunion = Reunion(
        tipo_reunion=1,
        fecha_reunion="2023-10-10",
        desc_reunion="Reunion anual",
    )
    db.add(nuevo_reunion)
    db.commit()
    db.refresh(nuevo_reunion)

    db.close()

    # Llamar endpoint
    response = client.get(f"/reuniones/{nuevo_reunion.id_reunion}")
    assert response.status_code == 200
    data = response.json()

    # Comprobar que los datos devueltos son iguales
    assert data["tipo_reunion"] == 1
    assert data["fecha_reunion"] == "2023-10-10"
    assert data["desc_reunion"] == "Reunion anual"


def test_get_reunion_no_existe():
    response = client.get("/reuniones/999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Reunion not found"


def test_create_reunion():
    payload = {
        "tipo_reunion": 1,
        "fecha_reunion": "2023-10-10",
        "desc_reunion": "Reunion anual",
    }

    response = client.post("/reuniones/", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Comprobar que los datos devueltos son correctos
    assert data["tipo_reunion"] == 1
    assert data["fecha_reunion"] == "2023-10-10"
    assert data["desc_reunion"] == "Reunion anual"
