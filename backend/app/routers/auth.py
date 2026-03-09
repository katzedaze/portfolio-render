from __future__ import annotations

import bcrypt
from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

from app.database import SessionDep
from app.dependencies.auth import AdminDep, create_access_token
from app.models.models import AdminUser
from app.schemas.auth import AdminUserResponse, LoginRequest, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, session: SessionDep) -> TokenResponse:
    admin = session.exec(select(AdminUser).where(AdminUser.email == body.email)).first()
    if admin is None or not verify_password(body.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    access_token = create_access_token({"sub": admin.email})
    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=AdminUserResponse)
def get_me(current_admin: AdminDep) -> AdminUserResponse:
    return AdminUserResponse(id=current_admin.id, email=current_admin.email)  # type: ignore[arg-type]
