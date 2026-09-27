from __future__ import annotations

import os
from collections.abc import Generator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

os.environ.setdefault("HONEYCHAIN_SKIP_DEMO_SEED", "1")

from backend.database import reset_engine
from backend.main import create_app


@pytest.fixture()
def client(tmp_path: Path) -> Generator[TestClient, None, None]:
    url = f"sqlite:///{(tmp_path / 'honeychain-test.db').as_posix()}"
    reset_engine(url)
    application = create_app(bootstrap=True)
    with TestClient(application) as test_client:
        yield test_client


def add_reading(
    client: TestClient,
    hive_id: str = "IN-WB-001",
    weight_kg: float = 42.8,
    humidity_pct: float = 68.0,
    inside: float = 34.2,
    timestamp: str = "2026-09-14T10:00:00+00:00",
) -> None:
    response = client.post(
        "/api/sensor-readings",
        json={
            "hive_id": hive_id,
            "timestamp": timestamp,
            "inside_temperature_c": inside,
            "outside_temperature_c": 31.0,
            "humidity_pct": humidity_pct,
            "weight_kg": weight_kg,
            "source": "simulated",
        },
    )
    assert response.status_code == 201, response.text


@pytest.fixture()
def post_reading(client: TestClient):
    def _post(
        hive_id: str = "IN-WB-001",
        weight_kg: float = 42.8,
        humidity_pct: float = 68.0,
        inside: float = 34.2,
        timestamp: str = "2026-09-14T10:00:00+00:00",
    ) -> None:
        add_reading(
            client,
            hive_id=hive_id,
            weight_kg=weight_kg,
            humidity_pct=humidity_pct,
            inside=inside,
            timestamp=timestamp,
        )

    return _post


from sqlalchemy.orm import Session
from backend.database import get_db


@pytest.fixture()
def session(client: TestClient) -> Generator[Session, None, None]:
    """Get database session."""
    with next(get_db()) as sess:
        yield sess


@pytest.fixture()
def admin_token(client: TestClient) -> str:
    """Create and authenticate an admin user, return token."""
    # Create admin user
    response = client.post(
        "/api/auth/register",
        json={
            "username": "test_admin",
            "password": "AdminTest!@Strong99",
            "display_name": "Test Admin",
            "email": "admin@test.com",
            "phone": "+1234567890",
            "region": "Test Region",
            "language": "en",
        }
    )
    assert response.status_code == 201
    
    # Manually upgrade to admin (in real app, use invitation)
    with next(get_db()) as sess:
        from backend.models.user import UserRecord
        user = sess.query(UserRecord).filter_by(username="test_admin").first()
        user.role = "admin"
        sess.commit()
    
    # Login to get token
    login_response = client.post(
        "/api/auth/login",
        json={"username": "test_admin", "password": "AdminTest!@Strong99"}
    )
    assert login_response.status_code == 200
    return login_response.json()["access_token"]


@pytest.fixture()
def beekeeper_token(client: TestClient) -> str:
    """Create and authenticate a beekeeper user, return token."""
    response = client.post(
        "/api/auth/register",
        json={
            "username": "test_beekeeper",
            "password": "BeekeeperTest!@Strong99",
            "display_name": "Test Beekeeper",
            "email": "beekeeper@test.com",
            "phone": "+1234567891",
            "region": "Test Region",
            "language": "en",
        }
    )
    assert response.status_code == 201
    return response.json()["access_token"]


@pytest.fixture()
def officer_token(client: TestClient, admin_token: str) -> str:
    """Create and authenticate an officer user, return token."""
    # Create officer via admin endpoint
    response = client.post(
        "/api/admin/users",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "username": "test_officer",
            "password": "OfficerTest!@Strong99",
            "display_name": "Test Officer",
            "role": "officer",
            "email": "officer@test.com",
            "phone": "+1234567892",
            "region": "Test Region",
        }
    )
    assert response.status_code == 201
    
    # Login to get token
    login_response = client.post(
        "/api/auth/login",
        json={"username": "test_officer", "password": "OfficerTest!@Strong99"}
    )
    assert login_response.status_code == 200
    return login_response.json()["access_token"]
