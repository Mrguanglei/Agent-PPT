from sqlalchemy import Column, Integer, Text, String, ForeignKey, UniqueConstraint, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.models.base import Base


class Slide(Base):
    __tablename__ = "slides"
    __table_args__ = (UniqueConstraint('project_id', 'index', name='uq_project_slide_index'),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    index = Column(Integer, nullable=False)
    html_content = Column(Text, nullable=False)
    thumbnail_url = Column(String(500))
    style_config = Column(JSONB, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 关系
    project = relationship("Project", back_populates="slides")
    assets = relationship("SlideAsset", back_populates="slide", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Slide {self.project_id} - {self.index}>"


class SlideAsset(Base):
    __tablename__ = "slide_assets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slide_id = Column(UUID(as_uuid=True), ForeignKey("slides.id", ondelete="CASCADE"), nullable=False)
    asset_type = Column(String(50), nullable=False)  # image, chart, icon, video
    asset_url = Column(String(500), nullable=False)
    source_query = Column(Text)
    meta_data = Column(JSONB, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 关系
    slide = relationship("Slide", back_populates="assets")

    def __repr__(self):
        return f"<SlideAsset {self.asset_type} - {self.asset_url}>"
