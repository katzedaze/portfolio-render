"""MailHog integration tests for contact form email notifications.

These tests require a running MailHog instance (SMTP on port 1025, HTTP API on
port 8025).  They are marked with ``@pytest.mark.integration`` so they can be
excluded from the standard CI test run with::

    pytest --ignore=tests/integration

or::

    pytest -m "not integration"

To run only integration tests::

    pytest -m integration
"""
from __future__ import annotations

from unittest.mock import patch

import pytest
import requests

MAILHOG_API = "http://localhost:8025/api"
MAILHOG_TIMEOUT = 3  # seconds


def _mailhog_available() -> bool:
    """Return True if MailHog's HTTP API is reachable."""
    try:
        resp = requests.get(f"{MAILHOG_API}/v2/messages", timeout=MAILHOG_TIMEOUT)
        return resp.status_code == 200
    except requests.exceptions.ConnectionError:
        return False


mailhog_running = pytest.mark.skipif(
    not _mailhog_available(),
    reason="MailHog is not running on localhost:8025",
)


@pytest.mark.integration
@mailhog_running
def test_contact_form_sends_email_notification(client):
    """Submitting a contact message should trigger an email notification via MailHog."""
    payload = {
        "name": "Alice Example",
        "email": "alice@example.com",
        "subject": "Hello from test",
        "message": "This is an integration test message.",
    }

    response = client.post("/api/contact", json=payload)
    assert response.status_code == 201

    # Fetch messages from MailHog
    mh_resp = requests.get(f"{MAILHOG_API}/v2/messages", timeout=MAILHOG_TIMEOUT)
    assert mh_resp.status_code == 200

    data = mh_resp.json()
    assert data["total"] >= 1, "Expected at least one email in MailHog after contact submission"

    # Find our message
    items = data["items"]
    assert items, "MailHog returned no messages"

    latest = items[0]
    subject_header = latest["Content"]["Headers"].get("Subject", [""])[0]
    assert "Hello from test" in subject_header, (
        f"Email subject did not contain the contact subject. Got: {subject_header!r}"
    )

    to_header = latest["Content"]["Headers"].get("To", [""])[0]
    assert "notify@example.com" in to_header, (
        f"Email To header did not contain notification address. Got: {to_header!r}"
    )

    from_header = latest["Content"]["Headers"].get("From", [""])[0]
    assert "alice@example.com" in from_header, (
        f"Email From header did not contain sender's address. Got: {from_header!r}"
    )


@pytest.mark.integration
@mailhog_running
def test_contact_form_email_body_contains_message(client):
    """The notification email body should include the contact message text."""
    payload = {
        "name": "Bob Tester",
        "email": "bob@example.com",
        "subject": "Body check",
        "message": "Unique body content XYZ789",
    }

    response = client.post("/api/contact", json=payload)
    assert response.status_code == 201

    mh_resp = requests.get(f"{MAILHOG_API}/v2/messages", timeout=MAILHOG_TIMEOUT)
    assert mh_resp.status_code == 200

    data = mh_resp.json()
    assert data["total"] >= 1

    latest = data["items"][0]
    # MailHog stores the raw body in Content.Body
    body = latest["Content"]["Body"]
    assert "Unique body content XYZ789" in body, (
        f"Contact message text not found in email body. Body: {body!r}"
    )
    assert "Bob Tester" in body, (
        f"Sender name not found in email body. Body: {body!r}"
    )


@pytest.mark.integration
@mailhog_running
def test_contact_form_saves_to_db_regardless_of_email(client):
    """Contact form submission should persist to the database even when email is sent."""
    payload = {
        "name": "Charlie DB",
        "email": "charlie@example.com",
        "subject": "DB persistence check",
        "message": "Should be in database.",
    }

    response = client.post("/api/contact", json=payload)
    assert response.status_code == 201

    resp_data = response.json()
    assert resp_data["name"] == "Charlie DB"
    assert resp_data["email"] == "charlie@example.com"
    assert resp_data["subject"] == "DB persistence check"
    assert "id" in resp_data


@pytest.mark.integration
def test_contact_form_no_mailhog_still_returns_201(client):
    """When SMTP raises, the API must still return 201 (email is best-effort).

    Patches smtplib.SMTP to raise ConnectionRefusedError, proving the
    exception handler inside _send_email_notification catches it gracefully.
    """
    with patch(
        "smtplib.SMTP",
        side_effect=ConnectionRefusedError("Simulated SMTP failure"),
    ):
        payload = {
            "name": "Dave Noemail",
            "email": "dave@example.com",
            "subject": "SMTP failure test",
            "message": "Email will fail but API should succeed.",
        }

        response = client.post("/api/contact", json=payload)

    assert response.status_code == 201, (
        f"API should return 201 even when SMTP raises. Got {response.status_code}: {response.text}"
    )
