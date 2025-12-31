"""
Base Model Mixins
"""
import uuid
from datetime import datetime
from typing import Any
from sqlalchemy import Column, String, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declared_attr


class TimestampMixin:
    """Mixin for adding timestamp columns"""

    @declared_attr
    def created_at(cls) -> Column:
        return Column(DateTime, default=func.now(), nullable=False)

    @declared_attr
    def updated_at(cls) -> Column:
        return Column(
            DateTime,
            default=func.now(),
            onupdate=func.now(),
            nullable=False,
        )


class UUIDMixin:
    """Mixin for adding UUID primary key"""

    @declared_attr
    def id(cls) -> Column:
        return Column(
            UUID(as_uuid=True),
            primary_key=True,
            default=uuid.uuid4,
            nullable=False,
        )
