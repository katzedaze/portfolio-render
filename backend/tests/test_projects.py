from __future__ import annotations

import bcrypt
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.models import AdminUser, Project


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


def test_list_projects_returns_empty_list(client: TestClient) -> None:
    response = client.get("/api/projects")
    assert response.status_code == 200
    assert response.json() == []


def test_create_project_without_auth_returns_401(client: TestClient) -> None:
    payload = {
        "title": "My Project",
        "slug": "my-project",
        "description": "A great project",
        "content": "Project content here",
        "is_featured": False,
        "is_published": True,
        "sort_order": 0,
        "skill_ids": [],
    }
    response = client.post("/api/projects", json=payload)
    assert response.status_code == 401


def test_create_project_with_auth_creates_project(
    client: TestClient, session: Session
) -> None:
    token = _get_auth_token(client, session)

    payload = {
        "title": "My Project",
        "slug": "my-project",
        "description": "A great project",
        "content": "Project content here",
        "is_featured": False,
        "is_published": True,
        "sort_order": 0,
        "skill_ids": [],
    }

    response = client.post(
        "/api/projects",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "My Project"
    assert data["slug"] == "my-project"
    assert data["is_published"] is True
    assert "id" in data


def test_get_project_by_id_returns_project(
    client: TestClient, session: Session
) -> None:
    token = _get_auth_token(client, session)

    # Create a project first
    payload = {
        "title": "Specific Project",
        "slug": "specific-project",
        "description": "A specific project",
        "content": "Content here",
        "is_featured": False,
        "is_published": True,
        "sort_order": 0,
        "skill_ids": [],
    }
    create_response = client.post(
        "/api/projects",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    project_id = create_response.json()["id"]

    # Fetch it by id
    response = client.get(f"/api/projects/{project_id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == project_id
    assert data["title"] == "Specific Project"


def test_get_nonexistent_project_returns_404(client: TestClient) -> None:
    response = client.get("/api/projects/99999")
    assert response.status_code == 404


def test_list_projects_only_returns_published(
    client: TestClient, session: Session
) -> None:
    token = _get_auth_token(client, session)

    # Create a published project
    client.post(
        "/api/projects",
        json={
            "title": "Published",
            "slug": "published",
            "description": "Published project",
            "content": "Content",
            "is_published": True,
            "is_featured": False,
            "sort_order": 0,
            "skill_ids": [],
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    # Create an unpublished project
    client.post(
        "/api/projects",
        json={
            "title": "Draft",
            "slug": "draft",
            "description": "Draft project",
            "content": "Content",
            "is_published": False,
            "is_featured": False,
            "sort_order": 1,
            "skill_ids": [],
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    response = client.get("/api/projects")
    assert response.status_code == 200
    projects = response.json()
    # Only published projects should be returned
    assert len(projects) == 1
    assert projects[0]["title"] == "Published"


def test_get_unpublished_project_by_id_returns_200(
    client: TestClient, session: Session
) -> None:
    """GET /api/projects/{id} no longer filters by is_published."""
    token = _get_auth_token(client, session)

    create_response = client.post(
        "/api/projects",
        json={
            "title": "Draft Project",
            "slug": "draft-project",
            "description": "Unpublished",
            "content": "Content",
            "is_published": False,
            "is_featured": False,
            "sort_order": 0,
            "skill_ids": [],
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    project_id = create_response.json()["id"]

    response = client.get(f"/api/projects/{project_id}")
    assert response.status_code == 200
    assert response.json()["title"] == "Draft Project"


def test_list_projects_admin_returns_all(
    client: TestClient, session: Session
) -> None:
    """GET /api/projects/admin returns all projects (published and unpublished)."""
    token = _get_auth_token(client, session)

    # Create a published project
    client.post(
        "/api/projects",
        json={
            "title": "Published",
            "slug": "published-admin",
            "description": "Published",
            "content": "Content",
            "is_published": True,
            "is_featured": False,
            "sort_order": 0,
            "skill_ids": [],
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    # Create an unpublished project
    client.post(
        "/api/projects",
        json={
            "title": "Draft",
            "slug": "draft-admin",
            "description": "Draft",
            "content": "Content",
            "is_published": False,
            "is_featured": False,
            "sort_order": 1,
            "skill_ids": [],
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    response = client.get(
        "/api/projects/admin",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    projects = response.json()
    assert len(projects) == 2


def test_list_projects_admin_without_auth_returns_401(
    client: TestClient,
) -> None:
    response = client.get("/api/projects/admin")
    assert response.status_code == 401


def test_list_projects_filter_by_is_featured(
    client: TestClient, session: Session
) -> None:
    """GET /api/projects supports optional is_featured query param."""
    token = _get_auth_token(client, session)

    client.post(
        "/api/projects",
        json={
            "title": "Featured",
            "slug": "featured",
            "description": "Featured project",
            "content": "Content",
            "is_published": True,
            "is_featured": True,
            "sort_order": 0,
            "skill_ids": [],
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    client.post(
        "/api/projects",
        json={
            "title": "Not Featured",
            "slug": "not-featured",
            "description": "Not featured",
            "content": "Content",
            "is_published": True,
            "is_featured": False,
            "sort_order": 1,
            "skill_ids": [],
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    # Filter by is_featured=true
    response = client.get("/api/projects", params={"is_featured": "true"})
    assert response.status_code == 200
    projects = response.json()
    assert len(projects) == 1
    assert projects[0]["title"] == "Featured"

    # Without filter, both published projects are returned
    response = client.get("/api/projects")
    assert response.status_code == 200
    assert len(response.json()) == 2
