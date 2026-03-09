from __future__ import annotations

import io
import bcrypt
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.models import AdminUser


def _create_admin(session: Session, email: str = "admin@test.com", password: str = "testpassword") -> AdminUser:
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    admin = AdminUser(email=email, hashed_password=hashed)
    session.add(admin)
    session.commit()
    session.refresh(admin)
    return admin


def _get_auth_token(client: TestClient, session: Session) -> str:
    _create_admin(session)
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@test.com", "password": "testpassword"},
    )
    return response.json()["access_token"]


def test_upload_without_auth_returns_401(client: TestClient) -> None:
    file_content = b"fake image data"
    response = client.post(
        "/api/upload",
        files={"file": ("test.jpg", io.BytesIO(file_content), "image/jpeg")},
    )
    assert response.status_code == 401


def test_upload_with_disallowed_file_type_returns_400(
    client: TestClient, session: Session
) -> None:
    token = _get_auth_token(client, session)

    response = client.post(
        "/api/upload",
        files={"file": ("malware.exe", io.BytesIO(b"evil bytes"), "application/octet-stream")},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 400
    assert "File type not allowed" in response.json()["detail"]


def test_upload_with_file_over_5mb_returns_413(
    client: TestClient, session: Session
) -> None:
    token = _get_auth_token(client, session)

    # Create a file slightly over 5MB
    over_limit = 5 * 1024 * 1024 + 1  # 5MB + 1 byte
    large_content = b"x" * over_limit

    response = client.post(
        "/api/upload",
        files={"file": ("large.jpg", io.BytesIO(large_content), "image/jpeg")},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 413
    assert "File too large" in response.json()["detail"]


def test_upload_valid_image_with_auth(
    client: TestClient, session: Session, tmp_path: "pytest.TempPathFixture"  # type: ignore[name-defined]
) -> None:
    """This test verifies the upload endpoint accepts valid files.
    Note: actual file writing may fail outside Docker, but we can test the response logic."""
    import unittest.mock as mock

    token = _get_auth_token(client, session)
    small_image = b"\xff\xd8\xff" + b"x" * 100  # fake JPEG header + data

    # Mock the file writing to avoid filesystem dependency
    with mock.patch("pathlib.Path.write_bytes"):
        response = client.post(
            "/api/upload",
            files={"file": ("photo.jpg", io.BytesIO(small_image), "image/jpeg")},
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 200
    data = response.json()
    assert "url" in data
    assert data["url"].startswith("/uploads/")
    assert "filename" in data
