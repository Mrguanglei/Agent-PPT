"""
Slide Model
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, ForeignKey, Text, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.database import Base


class Slide(Base):
    """Slide model for storing generated PPT slides"""

    __tablename__ = "slides"
    __allow_unmapped__ = True

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Fields
    chat_id = Column(
        UUID(as_uuid=True),
        ForeignKey("chats.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    index = Column(Integer, nullable=False)  # Slide index within the presentation
    title = Column(String(500), nullable=True)  # Slide title
    html_content = Column(Text, nullable=False)  # Full HTML content
    thumbnail_url = Column(String(500), nullable=True)
    style_config = Column(JSONB, nullable=True, default={})  # Style configuration
    # Optional: store raw content for editing
    raw_content = Column(JSONB, nullable=True)  # {title, bullets, images, etc}

    # Relationships
    chat = relationship("Chat", back_populates="slides")

    def __repr__(self) -> str:
        return f"<Slide(id={self.id}, chat_id={self.chat_id}, index={self.index})>"
