from __future__ import annotations

from pydantic import BaseModel
from fastapi import APIRouter
from sqlmodel import func, select

from app.database import SessionDep
from app.dependencies.auth import AdminDep
from app.models.models import ContactMessage, Project, Skill

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


class DashboardStatsResponse(BaseModel):
    totalProjects: int
    publishedProjects: int
    totalSkills: int
    unreadMessages: int


@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    _admin: AdminDep, session: SessionDep
) -> DashboardStatsResponse:
    total_projects = session.exec(select(func.count(Project.id))).one()
    published_projects = session.exec(
        select(func.count(Project.id)).where(Project.is_published == True)  # noqa: E712
    ).one()
    total_skills = session.exec(select(func.count(Skill.id))).one()
    unread_messages = session.exec(
        select(func.count(ContactMessage.id)).where(ContactMessage.is_read == False)  # noqa: E712
    ).one()

    return DashboardStatsResponse(
        totalProjects=total_projects,
        publishedProjects=published_projects,
        totalSkills=total_skills,
        unreadMessages=unread_messages,
    )
