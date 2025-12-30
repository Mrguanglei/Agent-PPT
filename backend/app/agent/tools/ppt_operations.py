from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.slide import Slide
from app.models.project import Project, ProjectStatus
from app.services.slide_service import SlideService
import logging

logger = logging.getLogger(__name__)


async def initialize_design(
    title: str,
    description: str,
    slide_name: str,
    slide_num: int,
    width: int,
    height: int,
    project_id: str
) -> Dict[str, Any]:
    """
    初始化PPT设计

    Args:
        title: PPT标题
        description: PPT描述
        slide_name: PPT文件名
        slide_num: 总页数
        width: 宽度
        height: 高度
        project_id: 项目ID

    Returns:
        操作结果
    """
    try:
        async with get_db() as db:
            project = await db.get(Project, project_id)
            if not project:
                raise ValueError(f"Project {project_id} not found")

            # 更新项目信息
            project.title = title
            project.description = description
            project.status = ProjectStatus.GENERATING
            project.config = {
                "slide_name": slide_name,
                "slide_num": slide_num,
                "width": width,
                "height": height
            }

            await db.commit()

            logger.info(f"Initialized design for project {project_id}")
            return {
                "success": True,
                "project_id": str(project.id),
                "title": title
            }

    except Exception as e:
        logger.error(f"Initialize design error: {e}", exc_info=True)
        return {"success": False, "error": str(e)}


async def insert_page(
    index: int,
    html: str,
    action_description: str,
    project_id: str
) -> Dict[str, Any]:
    """
    插入新页面

    Args:
        index: 插入位置
        html: 页面HTML代码
        action_description: 操作描述
        project_id: 项目ID

    Returns:
        操作结果
    """
    try:
        async with get_db() as db:
            # 检查项目是否存在
            project = await db.get(Project, project_id)
            if not project:
                raise ValueError(f"Project {project_id} not found")

            # 创建新页面
            slide = Slide(
                project_id=project_id,
                index=index,
                html_content=html
            )

            db.add(slide)
            await db.commit()
            await db.refresh(slide)

            logger.info(f"Inserted slide at index {index} for project {project_id}")
            return {
                "success": True,
                "slide_id": str(slide.id),
                "index": index
            }

    except Exception as e:
        logger.error(f"Insert page error: {e}", exc_info=True)
        return {"success": False, "error": str(e)}


async def update_page(
    index: int,
    html: str,
    action_description: str,
    project_id: str
) -> Dict[str, Any]:
    """
    更新现有页面

    Args:
        index: 页面索引
        html: 更新后的HTML代码
        action_description: 操作描述
        project_id: 项目ID

    Returns:
        操作结果
    """
    try:
        async with get_db() as db:
            # 查找页面
            from sqlalchemy import select
            result = await db.execute(
                select(Slide).where(
                    Slide.project_id == project_id,
                    Slide.index == index
                )
            )
            slide = result.scalar_one_or_none()

            if not slide:
                raise ValueError(f"Slide at index {index} not found")

            # 更新内容
            slide.html_content = html
            await db.commit()

            logger.info(f"Updated slide at index {index} for project {project_id}")
            return {
                "success": True,
                "slide_id": str(slide.id),
                "index": index
            }

    except Exception as e:
        logger.error(f"Update page error: {e}", exc_info=True)
        return {"success": False, "error": str(e)}


async def remove_pages(
    indexes: List[int],
    action_description: str,
    project_id: str
) -> Dict[str, Any]:
    """
    删除页面

    Args:
        indexes: 要删除的页面索引列表
        action_description: 操作描述
        project_id: 项目ID

    Returns:
        操作结果
    """
    try:
        async with get_db() as db:
            from sqlalchemy import delete

            # 删除指定索引的页面
            await db.execute(
                delete(Slide).where(
                    Slide.project_id == project_id,
                    Slide.index.in_(indexes)
                )
            )
            await db.commit()

            logger.info(f"Removed slides at indexes {indexes} for project {project_id}")
            return {
                "success": True,
                "removed_count": len(indexes)
            }

    except Exception as e:
        logger.error(f"Remove pages error: {e}", exc_info=True)
        return {"success": False, "error": str(e)}
