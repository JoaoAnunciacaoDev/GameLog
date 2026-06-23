import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
    

def test_read_root(client):
    """Testa se a API está online."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "GameLog API rodando liso, liso!"}


def test_create_user(client):
    """Testa a rota de criação de usuários."""
    test_user = {
        "username": "testador_implacavel",
        "email": "testador@gamelog.com",
        "password": "senha_super_segura"
    }
    response = client.post("/users/", json=test_user)
    assert response.status_code == 201
    
    data = response.json()
    assert data["username"] == "testador_implacavel"
    assert data["email"] == "testador@gamelog.com"
    assert "id" in data
    assert "password" not in data


def test_login_user(client):
    """Cria um usuário e testa se ele consegue fazer login recebendo o Token JWT."""
    client.post("/users/", json={
        "username": "testador_implacavel",
        "email": "testador@gamelog.com",
        "password": "senha_super_segura"
    })
    
    login_data = {
        "username": "testador_implacavel", 
        "password": "senha_super_segura"
    }
    response = client.post("/login", data=login_data)
    
    assert response.status_code == 200
    json_data = response.json()
    assert "access_token" in json_data
    assert json_data["token_type"] == "bearer"


def test_create_tierlist_without_token(client):
    """Testa se a API bloqueia a criação de Tier List sem estar logado."""
    tierlist_data = {"title": "Meus RPGs Favoritos"}
    response = client.post("/tierlists/", json=tierlist_data)
    
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"
    

def test_create_tierlist_with_token(client):
    """Cria usuário, loga e testa a criação de uma Tier List."""
    client.post("/users/", json={
        "username": "testador_implacavel",
        "email": "testador@gamelog.com",
        "password": "senha_super_segura"
    })
    
    login_response = client.post("/login", data={
        "username": "testador_implacavel",
        "password": "senha_super_segura"
    })
    token = login_response.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    tierlist_data = {"title": "Meus RPGs Favoritos"}
    
    response = client.post("/tierlists/", json=tierlist_data, headers=headers)
    
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Meus RPGs Favoritos"
    assert "categories" in data
    assert len(data["categories"]) == 5
    assert data["categories"][0]["name"] == "S"