from __future__ import annotations

import os
import tempfile

# Configure SMTP to point at MailHog before importing app modules.
# These must be set before app.config is first imported.
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_integration.db")
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-integration-tests")
os.environ.setdefault("ADMIN_EMAIL", "admin@test.com")
os.environ.setdefault("ADMIN_PASSWORD", "testpassword")
os.environ["SMTP_HOST"] = "localhost"
os.environ["SMTP_PORT"] = "1025"
os.environ["NOTIFICATION_EMAIL"] = "notify@example.com"

_tmp_upload_dir = tempfile.mkdtemp()
os.environ["UPLOAD_DIR"] = _tmp_upload_dir

import pytest
import requests
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.config import settings
from app.database import get_session
from app.main import app

MAILHOG_API = "http://localhost:8025/api"


@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(autouse=True)
def clear_mailhog():
    """Clear all MailHog messages before each test.

    If MailHog is not available, the test will be skipped via the
    ``mailhog_available`` fixture used in the actual test functions.
    """
    try:
        requests.delete(f"{MAILHOG_API}/v1/messages", timeout=2)
    except requests.exceptions.ConnectionError:
        pass
    yield
