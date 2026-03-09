from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel

from app.schemas.skills import SkillResponse


class ProjectCreate(SQLModel):
    title: str
    slug: str
    description: str
    content: str
    thumbnail_url: Optional[str] = None
    live_url: Optional[str] = None
    github_url: Optional[str] = None
    is_featured: bool = False
    is_published: bool = False
    sort_order: int = 0
    skill_ids: list[int] = []


class ProjectUpdate(SQLModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    thumbnail_url: Optional[str] = None
    live_url: Optional[str] = None
    github_url: Optional[str] = None
    is_featured: Optional[bool] = None
    is_published: Optional[bool] = None
    sort_order: Optional[int] = None
    skill_ids: Optional[list[int]] = None


class ProjectResponse(SQLModel):
    id: int
    title: str
    slug: str
    description: str
    content: str
    thumbnail_url: Optional[str]
    live_url: Optional[str]
    github_url: Optional[str]
    is_featured: bool
    is_published: bool
    sort_order: int
    skills: list[SkillResponse] = []
    created_at: datetime
    updated_at: datetime
