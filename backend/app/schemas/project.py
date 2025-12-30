from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID
from .user import User


class ProjectBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    config: Optional[Dict[str, Any]] = {}


class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    meta_data: Optional[Dict[str, Any]] = None


class ProjectInDB(ProjectBase):
    id: UUID
    user_id: UUID
    status: str
    config: Dict[str, Any]
    meta_data: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Project(ProjectInDB):
    user: Optional[User] = None

    class Config:
        from_attributes = True


class ProjectWithSlides(Project):
    slides_count: Optional[int] = 0

    class Config:
        from_attributes = True
