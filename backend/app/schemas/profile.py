from __future__ import annotations

from typing import Optional

from sqlmodel import SQLModel


class ProfileUpdate(SQLModel):
    name: Optional[str] = None
    title: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    email: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None


class ProfileResponse(SQLModel):
    id: int
    name: str
    title: str
    bio: str
    avatar_url: Optional[str]
    email: Optional[str]
    github_url: Optional[str]
    linkedin_url: Optional[str]
