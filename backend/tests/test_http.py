import os
from pathlib import Path

from fastapi.testclient import TestClient

from app.config import Settings
from app.server import create_app

DATA = Path(__file__).resolve().parents[2] / "data"


def _settings() -> Settings:
    database_url = os.environ.get(
        "APP_DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/takeoff",
    )
    return Settings(database_url=database_url, data_dir=DATA)


def test_health_and_fixture_routes() -> None:
    with TestClient(create_app(_settings())) as client:
        health = client.get("/api/v1/health")
        assert health.status_code == 200
        assert health.json() == {"status": "ok"}

        plans = client.get("/api/v1/plans")
        assert plans.status_code == 200
        summaries = plans.json()
        rectangle = next(item for item in summaries if item["id"] == "rectangle")
        assert rectangle["wall_count"] == 5
        assert rectangle["opening_count"] == 2

        detail = client.get("/api/v1/plans/rectangle")
        assert detail.status_code == 200
        assert detail.json()["storey"]["height_m"] == 3

        missing = client.get("/api/v1/plans/does-not-exist")
        assert missing.status_code == 404

        libraries = client.get("/api/v1/libraries")
        assert libraries.status_code == 200
        assert [item["version"] for item in libraries.json()] == ["v1", "v2"]

        library = client.get("/api/v1/libraries/v1")
        assert library.status_code == 200
        assert library.json()["currency"] == "CRD"

        unknown_library = client.get("/api/v1/libraries/v9")
        assert unknown_library.status_code == 404
