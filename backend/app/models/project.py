from sqlalchemy import Column, String, Text, ForeignKey, Enum, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
import uuid
from app.models.base import Base


class ProjectStatus(str, enum.Enum):
    DRAFT = "draft"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"


class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.DRAFT)
    config = Column(JSONB, default={})
    meta_data = Column(JSONB, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 关系
    user = relationship("User", back_populates="projects")
    slides = relationship("Slide", back_populates="project", cascade="all, delete-orphan", order_by="Slide.index")
    conversations = relationship("Conversation", back_populates="project", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Project {self.title}>"
