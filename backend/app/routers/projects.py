from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

from app.database import SessionDep
from app.dependencies.auth import AdminDep
from app.models.models import Project, ProjectSkill, Skill
from app.schemas.projects import ProjectCreate, ProjectResponse, ProjectUpdate
from app.schemas.skills import SkillResponse

router = APIRouter(prefix="/api/projects", tags=["projects"])


def _build_response(project: Project) -> ProjectResponse:
    skills = [
        SkillResponse(
            id=s.id,  # type: ignore[arg-type]
            name=s.name,
            category=s.category,
            proficiency=s.proficiency,
            icon=s.icon,
            sort_order=s.sort_order,
        )
        for s in project.skills
    ]
    return ProjectResponse(
        id=project.id,  # type: ignore[arg-type]
        title=project.title,
        slug=project.slug,
        description=project.description,
        content=project.content,
        thumbnail_url=project.thumbnail_url,
        live_url=project.live_url,
        github_url=project.github_url,
        is_featured=project.is_featured,
        is_published=project.is_published,
        sort_order=project.sort_order,
        skills=skills,
        created_at=project.created_at,
        updated_at=project.updated_at,
    )


@router.get("/", response_model=list[ProjectResponse])
def list_projects(session: SessionDep) -> list[ProjectResponse]:
    projects = session.exec(
        select(Project).where(Project.is_published == True).order_by(Project.sort_order)  # noqa: E712
    ).all()
    return [_build_response(p) for p in projects]


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, session: SessionDep) -> ProjectResponse:
    project = session.get(Project, project_id)
    if project is None or not project.is_published:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return _build_response(project)


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(body: ProjectCreate, session: SessionDep, _: AdminDep) -> ProjectResponse:
    # Check slug uniqueness
    existing = session.exec(select(Project).where(Project.slug == body.slug)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists")

    project = Project(
        title=body.title,
        slug=body.slug,
        description=body.description,
        content=body.content,
        thumbnail_url=body.thumbnail_url,
        live_url=body.live_url,
        github_url=body.github_url,
        is_featured=body.is_featured,
        is_published=body.is_published,
        sort_order=body.sort_order,
    )
    session.add(project)
    session.flush()  # get the project id

    for skill_id in body.skill_ids:
        skill = session.get(Skill, skill_id)
        if skill is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Skill {skill_id} not found",
            )
        session.add(ProjectSkill(project_id=project.id, skill_id=skill_id))

    session.commit()
    session.refresh(project)
    return _build_response(project)


@router.patch("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int, body: ProjectUpdate, session: SessionDep, _: AdminDep
) -> ProjectResponse:
    project = session.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    update_data = body.model_dump(exclude_unset=True, exclude={"skill_ids"})
    for field, value in update_data.items():
        setattr(project, field, value)
    project.updated_at = datetime.now(timezone.utc)

    if body.skill_ids is not None:
        # Remove existing links
        existing_links = session.exec(
            select(ProjectSkill).where(ProjectSkill.project_id == project_id)
        ).all()
        for link in existing_links:
            session.delete(link)
        session.flush()

        for skill_id in body.skill_ids:
            skill = session.get(Skill, skill_id)
            if skill is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Skill {skill_id} not found",
                )
            session.add(ProjectSkill(project_id=project.id, skill_id=skill_id))

    session.add(project)
    session.commit()
    session.refresh(project)
    return _build_response(project)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: int, session: SessionDep, _: AdminDep) -> None:
    project = session.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    # Remove link table entries first
    links = session.exec(
        select(ProjectSkill).where(ProjectSkill.project_id == project_id)
    ).all()
    for link in links:
        session.delete(link)

    session.delete(project)
    session.commit()
