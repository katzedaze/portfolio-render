from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

from app.database import SessionDep
from app.dependencies.auth import AdminDep
from app.models.models import Profile
from app.schemas.profile import ProfileResponse, ProfileUpdate

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("", response_model=ProfileResponse)
def get_profile(session: SessionDep) -> ProfileResponse:
    profile = session.exec(select(Profile)).first()
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return ProfileResponse.model_validate(profile)


@router.put("", response_model=ProfileResponse)
def upsert_profile(body: ProfileUpdate, session: SessionDep, _: AdminDep) -> ProfileResponse:
    profile = session.exec(select(Profile)).first()
    if profile is None:
        # Create with required defaults - all fields must be provided for a new profile
        data = body.model_dump(exclude_unset=False)
        missing = [f for f in ("name", "title", "bio") if not data.get(f)]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Fields required for initial profile creation: {missing}",
            )
        profile = Profile(**{k: v for k, v in data.items() if v is not None})
    else:
        update_data = body.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(profile, field, value)

    session.add(profile)
    session.commit()
    session.refresh(profile)
    return ProfileResponse.model_validate(profile)
