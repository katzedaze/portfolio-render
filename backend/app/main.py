from __future__ import annotations

import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator

import bcrypt
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, SQLModel, select

from app.config import settings
from app.database import engine
from app.models.models import AdminUser  # noqa: F401 - required for table creation
from app.models.models import (  # noqa: F401 - required for table creation
    ContactMessage,
    Profile,
    Project,
    ProjectSkill,
    Skill,
)

UPLOAD_DIR = Path(os.environ.get("UPLOAD_DIR", "/code/uploads"))


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Create tables
    SQLModel.metadata.create_all(engine)

    # Ensure upload directory exists
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    # Seed admin user from env vars if not present
    with Session(engine) as session:
        existing_admin = session.exec(
            select(AdminUser).where(AdminUser.email == settings.ADMIN_EMAIL)
        ).first()
        if existing_admin is None:
            hashed = hash_password(settings.ADMIN_PASSWORD)
            admin = AdminUser(email=settings.ADMIN_EMAIL, hashed_password=hashed)
            session.add(admin)
            session.commit()

    yield


app = FastAPI(
    title="Portfolio API",
    version="0.1.0",
    lifespan=lifespan,
    redirect_slashes=False,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://portfolio-render-eight.vercel.app",
        "https://portfolio-render-5rpx8qs7q-katzedazes-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
from app.routers import (  # noqa: E402 - after app creation
    auth,
    contact,
    dashboard,
    health,
    profile,
    projects,
    skills,
    upload,
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(projects.router)
app.include_router(skills.router)
app.include_router(profile.router)
app.include_router(contact.router)
app.include_router(upload.router)

# Serve uploaded files (only mount if the directory exists)
if UPLOAD_DIR.exists():
    app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR), html=False), name="uploads")
