from __future__ import annotations

import logging
import smtplib
from email.mime.text import MIMEText

from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

from app.config import settings
from app.database import SessionDep
from app.dependencies.auth import AdminDep
from app.models.models import ContactMessage
from app.schemas.contact import ContactCreate, ContactResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/contact", tags=["contact"])


def _send_email_notification(message: ContactMessage) -> None:
    """Send an email notification when a new contact message is received.

    This is a best-effort operation; failures are logged but do not affect
    the API response.
    """
    if not settings.SMTP_HOST or not settings.NOTIFICATION_EMAIL:
        return

    body = (
        f"New contact message received:\n\n"
        f"From: {message.name} <{message.email}>\n"
        f"Subject: {message.subject}\n\n"
        f"{message.message}"
    )
    msg = MIMEText(body)
    msg["Subject"] = f"[Portfolio] New message: {message.subject}"
    msg["From"] = message.email
    msg["To"] = settings.NOTIFICATION_EMAIL

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as smtp:
            smtp.sendmail(message.email, [settings.NOTIFICATION_EMAIL], msg.as_string())
    except Exception:
        logger.exception("Failed to send email notification for contact message id=%s", message.id)


@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def submit_message(body: ContactCreate, session: SessionDep) -> ContactResponse:
    message = ContactMessage(
        name=body.name,
        email=body.email,
        subject=body.subject,
        message=body.message,
    )
    session.add(message)
    session.commit()
    session.refresh(message)
    _send_email_notification(message)
    return ContactResponse.model_validate(message)


@router.get("", response_model=list[ContactResponse])
def list_messages(session: SessionDep, _: AdminDep) -> list[ContactResponse]:
    messages = session.exec(
        select(ContactMessage).order_by(ContactMessage.created_at.desc())  # type: ignore[union-attr]
    ).all()
    return [ContactResponse.model_validate(m) for m in messages]


@router.patch("/{message_id}/read", response_model=ContactResponse)
def mark_as_read(message_id: int, session: SessionDep, _: AdminDep) -> ContactResponse:
    message = session.get(ContactMessage, message_id)
    if message is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    message.is_read = True
    session.add(message)
    session.commit()
    session.refresh(message)
    return ContactResponse.model_validate(message)


@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_message(message_id: int, session: SessionDep, _: AdminDep) -> None:
    message = session.get(ContactMessage, message_id)
    if message is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    session.delete(message)
    session.commit()
