from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlmodel import Column, Field, Relationship, SQLModel, Text

if TYPE_CHECKING:
    pass


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ---------------------------------------------------------------------------
# Many-to-many link table
# ---------------------------------------------------------------------------

class ProjectSkill(SQLModel, table=True):
    __tablename__ = "projectskill"

    project_id: int = Field(foreign_key="project.id", primary_key=True)
    skill_id: int = Field(foreign_key="skill.id", primary_key=True)


# ---------------------------------------------------------------------------
# Profile
# ---------------------------------------------------------------------------

class Profile(SQLModel, table=True):
    __tablename__ = "profile"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=200)
    title: str = Field(max_length=200)
    bio: str = Field(sa_column=Column(Text))
    avatar_url: Optional[str] = Field(default=None, max_length=500)
    email: Optional[str] = Field(default=None, max_length=200)
    github_url: Optional[str] = Field(default=None, max_length=500)
    linkedin_url: Optional[str] = Field(default=None, max_length=500)


# ---------------------------------------------------------------------------
# Skill
# ---------------------------------------------------------------------------

class Skill(SQLModel, table=True):
    __tablename__ = "skill"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100)
    category: str = Field(max_length=100)
    proficiency: int = Field(default=50, ge=1, le=100)
    icon: Optional[str] = Field(default=None, max_length=200)
    sort_order: int = Field(default=0)

    projects: list["Project"] = Relationship(
        back_populates="skills", link_model=ProjectSkill
    )


# ---------------------------------------------------------------------------
# Project
# ---------------------------------------------------------------------------

class Project(SQLModel, table=True):
    __tablename__ = "project"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200)
    slug: str = Field(max_length=200, unique=True, index=True)
    description: str = Field(sa_column=Column(Text))
    content: str = Field(sa_column=Column(Text))
    thumbnail_url: Optional[str] = Field(default=None, max_length=500)
    live_url: Optional[str] = Field(default=None, max_length=500)
    github_url: Optional[str] = Field(default=None, max_length=500)
    is_featured: bool = Field(default=False)
    is_published: bool = Field(default=False)
    sort_order: int = Field(default=0)
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)

    skills: list["Skill"] = Relationship(
        back_populates="projects", link_model=ProjectSkill
    )


# ---------------------------------------------------------------------------
# ContactMessage
# ---------------------------------------------------------------------------

class ContactMessage(SQLModel, table=True):
    __tablename__ = "contactmessage"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=200)
    email: str = Field(max_length=200)
    subject: str = Field(max_length=300)
    message: str = Field(sa_column=Column(Text))
    is_read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=utcnow)


# ---------------------------------------------------------------------------
# AdminUser
# ---------------------------------------------------------------------------

class AdminUser(SQLModel, table=True):
    __tablename__ = "adminuser"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(max_length=200, unique=True, index=True)
    hashed_password: str = Field(max_length=500)
