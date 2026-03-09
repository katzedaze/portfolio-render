from __future__ import annotations

import os
import uuid
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile, status
from pydantic import BaseModel

from app.dependencies.auth import AdminDep

UPLOAD_DIR = Path(os.environ.get("UPLOAD_DIR", "/code/uploads"))
try:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
except PermissionError:
    pass  # Directory creation skipped in test environments

router = APIRouter(prefix="/api", tags=["upload"])


class UploadResponse(BaseModel):
    url: str
    filename: str


@router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile, _: AdminDep) -> UploadResponse:
    if file.filename is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No filename provided")

    suffix = Path(file.filename).suffix.lower()
    allowed_suffixes = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".pdf"}
    if suffix not in allowed_suffixes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed: {', '.join(allowed_suffixes)}",
        )

    unique_filename = f"{uuid.uuid4()}{suffix}"
    dest = UPLOAD_DIR / unique_filename

    content = await file.read()

    max_size = 5 * 1024 * 1024  # 5MB
    if len(content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large. Maximum size is 5MB.",
        )

    dest.write_bytes(content)

    return UploadResponse(url=f"/uploads/{unique_filename}", filename=unique_filename)
