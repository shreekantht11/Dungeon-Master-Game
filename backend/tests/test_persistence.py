import os
import pytest
from fastapi.testclient import TestClient

# Import the app without executing code that depends on runtime state
from backend.app import app


@pytest.fixture(scope="session")
def client():
    # Note: app lifespan will try to connect to Mongo if MONGODB_URI is set.
    # If it's not set or invalid, some DB endpoints may fail with 503.
    return TestClient(app)


def test_models_endpoint(client):
    resp = client.get("/api/models")
    # Endpoint should exist even if model listing fails internally
    assert resp.status_code in (200, 500)


def test_get_saves_route_wired(client):
    resp = client.get("/api/saves/test-player")
    # If no DB, expect 503; with DB, 200
    assert resp.status_code in (200, 503)


def test_load_by_name_route_wired(client):
    resp = client.get("/api/load/by-name", params={"name": "test-player"})
    # With DB and no saves: 404; without DB: 503; if exists: 200
    assert resp.status_code in (200, 404, 503)


def test_cameo_invite_endpoint(client):
    payload = {
        "playerId": "Tester",
        "cameoPlayer": {
            "name": "Tester",
            "class": "Warrior",
            "gender": "Other",
            "level": 1,
            "health": 100,
            "maxHealth": 100,
            "xp": 0,
            "maxXp": 100,
            "position": {"x": 0, "y": 0},
            "inventory": [],
            "stats": {"strength": 10, "intelligence": 5, "agility": 7},
          },
        "personalMessage": "Join me!",
        "expiresInMinutes": 30,
    }
    resp = client.post("/api/cameo/invite", json=payload)
    assert resp.status_code in (200, 400, 503)


def test_cameo_accept_endpoint(client):
    resp = client.post("/api/cameo/accept", json={"playerId": "Tester", "inviteCode": "INVALID"})
    assert resp.status_code in (200, 404, 410, 409, 503)


