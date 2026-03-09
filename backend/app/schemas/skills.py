from __future__ import annotations

from typing import Optional

from sqlmodel import SQLModel


class SkillCreate(SQLModel):
    name: str
    category: str
    proficiency: int = 50
    icon: Optional[str] = None
    sort_order: int = 0


class SkillUpdate(SQLModel):
    name: Optional[str] = None
    category: Optional[str] = None
    proficiency: Optional[int] = None
    icon: Optional[str] = None
    sort_order: Optional[int] = None


class SkillResponse(SQLModel):
    id: int
    name: str
    category: str
    proficiency: int
    icon: Optional[str]
    sort_order: int
