"""
Database Connection and Session Management
"""
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
)
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool

from app.config import settings

# Create async engine
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    future=True,
    poolclass=NullPool if settings.is_development else None,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# Create async session factory (SQLAlchemy 1.4 compatible)
async_session_maker = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Base class for models
class Base:
    """Base class for all ORM models"""
    __allow_unmapped__ = True


Base = declarative_base(cls=Base)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for getting async database sessions"""
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Initialize database tables"""
    async with engine.begin() as conn:
        # Import all models here to ensure they are registered
        from app.models import user, chat, message, tool_call, slide

        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
