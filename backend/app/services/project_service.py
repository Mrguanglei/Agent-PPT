from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from uuid import UUID
from app.models.project import Project, ProjectStatus
from app.schemas.project import ProjectCreate, ProjectUpdate


class ProjectService:
    """项目服务"""

    @classmethod
    async def create_project(
        cls,
        db: AsyncSession,
        user_id: UUID,
        project_data: ProjectCreate
    ) -> Project:
        """创建项目"""
        project = Project(
            user_id=user_id,
            title=project_data.title,
            description=project_data.description,
            config=project_data.config
        )

        db.add(project)
        await db.commit()
        await db.refresh(project)
        return project

    @classmethod
    async def get_project(cls, db: AsyncSession, project_id: UUID, user_id: UUID) -> Optional[Project]:
        """获取项目"""
        result = await db.execute(
            select(Project).where(
                Project.id == project_id,
                Project.user_id == user_id
            )
        )
        return result.scalar_one_or_none()

    @classmethod
    async def get_projects_by_user(cls, db: AsyncSession, user_id: UUID) -> List[Project]:
        """获取用户的项目列表"""
        result = await db.execute(
            select(Project).where(Project.user_id == user_id).order_by(Project.created_at.desc())
        )
        return list(result.scalars().all())

    @classmethod
    async def update_project(
        cls,
        db: AsyncSession,
        project_id: UUID,
        user_id: UUID,
        project_data: ProjectUpdate
    ) -> Optional[Project]:
        """更新项目"""
        # 获取项目
        project = await cls.get_project(db, project_id, user_id)
        if not project:
            return None

        # 更新字段
        update_data = project_data.dict(exclude_unset=True)
        if update_data:
            await db.execute(
                update(Project)
                .where(Project.id == project_id, Project.user_id == user_id)
                .values(**update_data)
            )
            await db.commit()
            await db.refresh(project)

        return project

    @classmethod
    async def delete_project(cls, db: AsyncSession, project_id: UUID, user_id: UUID) -> bool:
        """删除项目"""
        result = await db.execute(
            delete(Project).where(
                Project.id == project_id,
                Project.user_id == user_id
            )
        )
        await db.commit()
        return result.rowcount > 0

    @classmethod
    async def update_project_status(
        cls,
        db: AsyncSession,
        project_id: UUID,
        status: ProjectStatus
    ) -> bool:
        """更新项目状态"""
        result = await db.execute(
            update(Project)
            .where(Project.id == project_id)
            .values(status=status)
        )
        await db.commit()
        return result.rowcount > 0
