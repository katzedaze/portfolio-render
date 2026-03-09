from __future__ import annotations

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


def test_list_skills_returns_empty_list(client: TestClient) -> None:
    response = client.get("/api/skills/")
    assert response.status_code == 200
    assert response.json() == []


def test_create_skill_without_auth_returns_401(client: TestClient) -> None:
    payload = {"name": "Python", "category": "Language", "proficiency": 90}
    response = client.post("/api/skills/", json=payload)
    assert response.status_code == 401


def test_create_skill_with_auth(client: TestClient, session: Session) -> None:
    token = _get_auth_token(client, session)

    payload = {"name": "Python", "category": "Language", "proficiency": 90, "sort_order": 0}

    response = client.post(
        "/api/skills/",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Python"
    assert data["category"] == "Language"
    assert data["proficiency"] == 90
    assert "id" in data


def test_list_skills_returns_created_skills(
    client: TestClient, session: Session
) -> None:
    token = _get_auth_token(client, session)

    # Create two skills
    client.post(
        "/api/skills/",
        json={"name": "Python", "category": "Language", "proficiency": 90, "sort_order": 0},
        headers={"Authorization": f"Bearer {token}"},
    )
    client.post(
        "/api/skills/",
        json={"name": "React", "category": "Framework", "proficiency": 80, "sort_order": 1},
        headers={"Authorization": f"Bearer {token}"},
    )

    response = client.get("/api/skills/")
    assert response.status_code == 200
    skills = response.json()
    assert len(skills) == 2


def test_update_skill_with_auth(client: TestClient, session: Session) -> None:
    token = _get_auth_token(client, session)

    # Create a skill
    create_response = client.post(
        "/api/skills/",
        json={"name": "Python", "category": "Language", "proficiency": 70, "sort_order": 0},
        headers={"Authorization": f"Bearer {token}"},
    )
    skill_id = create_response.json()["id"]

    # Update it
    update_response = client.patch(
        f"/api/skills/{skill_id}",
        json={"proficiency": 95},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert update_response.status_code == 200
    assert update_response.json()["proficiency"] == 95


def test_update_skill_without_auth_returns_401(
    client: TestClient, session: Session
) -> None:
    token = _get_auth_token(client, session)

    create_response = client.post(
        "/api/skills/",
        json={"name": "Python", "category": "Language", "proficiency": 70, "sort_order": 0},
        headers={"Authorization": f"Bearer {token}"},
    )
    skill_id = create_response.json()["id"]

    response = client.patch(f"/api/skills/{skill_id}", json={"proficiency": 95})
    assert response.status_code == 401


def test_delete_skill_with_auth(client: TestClient, session: Session) -> None:
    token = _get_auth_token(client, session)

    create_response = client.post(
        "/api/skills/",
        json={"name": "ToDelete", "category": "Language", "proficiency": 50, "sort_order": 0},
        headers={"Authorization": f"Bearer {token}"},
    )
    skill_id = create_response.json()["id"]

    delete_response = client.delete(
        f"/api/skills/{skill_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert delete_response.status_code == 204

    # Verify it's gone
    list_response = client.get("/api/skills/")
    assert len(list_response.json()) == 0


def test_delete_nonexistent_skill_returns_404(
    client: TestClient, session: Session
) -> None:
    token = _get_auth_token(client, session)

    response = client.delete(
        "/api/skills/99999",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 404
