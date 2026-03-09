from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

from app.database import SessionDep
from app.dependencies.auth import AdminDep
from app.models.models import Skill
from app.schemas.skills import SkillCreate, SkillResponse, SkillUpdate

router = APIRouter(prefix="/api/skills", tags=["skills"])


@router.get("", response_model=list[SkillResponse])
def list_skills(session: SessionDep) -> list[SkillResponse]:
    skills = session.exec(select(Skill).order_by(Skill.sort_order)).all()
    return [SkillResponse.model_validate(s) for s in skills]


@router.post("", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
def create_skill(body: SkillCreate, session: SessionDep, _: AdminDep) -> SkillResponse:
    skill = Skill(**body.model_dump())
    session.add(skill)
    session.commit()
    session.refresh(skill)
    return SkillResponse.model_validate(skill)


@router.patch("/{skill_id}", response_model=SkillResponse)
def update_skill(skill_id: int, body: SkillUpdate, session: SessionDep, _: AdminDep) -> SkillResponse:
    skill = session.get(Skill, skill_id)
    if skill is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(skill, field, value)
    session.add(skill)
    session.commit()
    session.refresh(skill)
    return SkillResponse.model_validate(skill)


@router.delete("/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_skill(skill_id: int, session: SessionDep, _: AdminDep) -> None:
    skill = session.get(Skill, skill_id)
    if skill is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
    session.delete(skill)
    session.commit()
