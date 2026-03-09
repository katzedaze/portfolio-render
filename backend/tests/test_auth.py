from __future__ import annotations

import bcrypt
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.models import AdminUser


def _create_admin(session: Session, email: str = "admin@test.com", password: str = "testpassword") -> AdminUser:
    """Helper to seed an admin user into the test database."""
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    admin = AdminUser(email=email, hashed_password=hashed)
    session.add(admin)
    session.commit()
    session.refresh(admin)
    return admin


def test_login_with_valid_credentials_returns_token(
    client: TestClient, session: Session
) -> None:
    _create_admin(session, email="admin@test.com", password="correctpass")

    response = client.post(
        "/api/auth/login",
        json={"email": "admin@test.com", "password": "correctpass"},
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert len(data["access_token"]) > 0


def test_login_with_invalid_password_returns_401(
    client: TestClient, session: Session
) -> None:
    _create_admin(session, email="admin@test.com", password="correctpass")

    response = client.post(
        "/api/auth/login",
        json={"email": "admin@test.com", "password": "wrongpassword"},
    )

    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_login_with_unknown_email_returns_401(client: TestClient) -> None:
    response = client.post(
        "/api/auth/login",
        json={"email": "nobody@test.com", "password": "anypassword"},
    )

    assert response.status_code == 401


def test_get_me_with_valid_token(client: TestClient, session: Session) -> None:
    _create_admin(session, email="admin@test.com", password="correctpass")

    login_response = client.post(
        "/api/auth/login",
        json={"email": "admin@test.com", "password": "correctpass"},
    )
    token = login_response.json()["access_token"]

    me_response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert me_response.status_code == 200
    assert me_response.json()["email"] == "admin@test.com"


def test_get_me_without_token_returns_401(client: TestClient) -> None:
    response = client.get("/api/auth/me")

    assert response.status_code == 401
