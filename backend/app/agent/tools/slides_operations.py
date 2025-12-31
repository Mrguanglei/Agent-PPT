"""
Slide Operations Tools - initialize_slide, insert_slides, html, update_slide
"""
from typing import Dict, Any, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import async_session_maker
from app.models.chat import Chat
from app.models.slide import Slide
from app.models.message import Message, MessageRole
from app.utils.redis_client import redis_client
from app.agent.config import get_color_scheme, get_font_scheme, get_layout_type


async def get_db_session() -> AsyncSession:
    """Get database session"""
    return async_session_maker()


async def initialize_slide(
    description: str,
    slide_name: str,
    title: str,
    slide_num: int,
    width: int = 1280,
    height: int = 720,
    color_scheme: Optional[str] = None,
    font_scheme: Optional[str] = None,
    chat_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Initialize the slide design framework.

    Args:
        description: Content summary and design style description
        slide_name: PPT file name
        title: PPT main title
        slide_num: Expected total number of slides
        width: Slide width (fixed 1280)
        height: Slide height (fixed 720)
        color_scheme: Color scheme name
        font_scheme: Font scheme name
        chat_id: Chat ID

    Returns:
        Initialization confirmation with design settings
    """
    async with async_session_maker() as db:
        try:
            # Get color and font schemes
            color_config = get_color_scheme(color_scheme or "minimalist_white")
            font_config = get_font_scheme(font_scheme or "business")

            # Update chat if chat_id provided
            if chat_id:
                result = await db.execute(select(Chat).where(Chat.id == chat_id))
                chat = result.scalar_one_or_none()
                if chat:
                    chat.title = title
                    # Store design config in metadata
                    import json
                    chat.metadata = json.dumps({
                        "slide_name": slide_name,
                        "slide_num": slide_num,
                        "color_scheme": color_scheme or "minimalist_white",
                        "font_scheme": font_scheme or "business",
                        "width": width,
                        "height": height,
                    })
                    await db.commit()

            # Publish initialization event
            await redis_client.publish(
                f"chat_updates:{chat_id}",
                {
                    "type": "slide_update",
                    "payload": {
                        "action": "initialize",
                        "title": title,
                        "slide_name": slide_name,
                        "slide_num": slide_num,
                        "color_scheme": color_config,
                        "font_scheme": font_config,
                    }
                }
            )

            return {
                "success": True,
                "message": f"Presentation '{title}' initialized",
                "title": title,
                "slide_name": slide_name,
                "slide_num": slide_num,
                "dimensions": {"width": width, "height": height},
                "color_scheme": color_config,
                "font_scheme": font_config,
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
            }


async def insert_slides(
    index: int,
    task_brief: str,
    layout: str,
    file_prefix: str,
    chat_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Insert a new slide into the presentation.

    Args:
        index: Slide page index (starts from 1)
        task_brief: Brief task description for this slide
        layout: Layout type
        file_prefix: HTML file name prefix
        chat_id: Chat ID

    Returns:
        Created slide information
    """
    async with async_session_maker() as db:
        try:
            if not chat_id:
                return {
                    "success": False,
                    "error": "chat_id is required",
                }

            # Check if slide already exists at this index
            result = await db.execute(
                select(Slide).where(Slide.chat_id == chat_id, Slide.index == index)
            )
            existing_slide = result.scalar_one_or_none()

            # Get layout info
            layout_info = get_layout_type(layout)

            if existing_slide:
                # Update existing slide
                existing_slide.title = task_brief
                existing_slide.raw_content = {
                    "task_brief": task_brief,
                    "layout": layout,
                    "layout_info": layout_info,
                }
                await db.commit()

                # Publish update event
                await redis_client.publish(
                    f"chat_updates:{chat_id}",
                    {
                        "type": "slide_update",
                        "payload": {
                            "action": "update",
                            "slide_index": index,
                            "task_brief": task_brief,
                            "layout": layout,
                        }
                    }
                )

                return {
                    "success": True,
                    "message": f"Slide {index} updated",
                    "slide_id": str(existing_slide.id),
                    "index": index,
                    "task_brief": task_brief,
                }

            # Create new slide
            slide = Slide(
                chat_id=chat_id,
                index=index,
                title=task_brief,
                raw_content={
                    "task_brief": task_brief,
                    "layout": layout,
                    "layout_info": layout_info,
                    "file_prefix": file_prefix,
                },
                html_content=f"<!-- Placeholder for slide {index}: {task_brief} -->",
                style_config={"layout": layout},
            )

            db.add(slide)
            await db.commit()
            await db.refresh(slide)

            # Publish creation event
            await redis_client.publish(
                f"chat_updates:{chat_id}",
                {
                    "type": "slide_update",
                    "payload": {
                        "action": "create",
                        "slide_index": index,
                        "task_brief": task_brief,
                        "layout": layout,
                    }
                }
            )

            return {
                "success": True,
                "message": f"Slide {index} created",
                "slide_id": str(slide.id),
                "index": index,
                "task_brief": task_brief,
                "layout": layout,
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
            }


async def html(
    index: int,
    file_prefix: str,
    html_code: str,
    chat_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Generate/update HTML content for a slide.

    Args:
        index: Slide page index
        file_prefix: File name prefix (should match the one used in insert_slides)
        html_code: Complete HTML code
        chat_id: Chat ID

    Returns:
        Updated slide information
    """
    async with async_session_maker() as db:
        try:
            if not chat_id:
                return {
                    "success": False,
                    "error": "chat_id is required",
                }

            result = await db.execute(
                select(Slide).where(Slide.chat_id == chat_id, Slide.index == index)
            )
            slide = result.scalar_one_or_none()

            if not slide:
                return {
                    "success": False,
                    "error": f"Slide at index {index} not found. Call insert_slides first.",
                }

            # Update slide HTML content
            slide.html_content = html_code

            # Update file_prefix in raw_content
            raw_content = slide.raw_content or {}
            raw_content["file_prefix"] = file_prefix
            raw_content["html_generated"] = True
            slide.raw_content = raw_content

            await db.commit()

            # Publish update event
            await redis_client.publish(
                f"chat_updates:{chat_id}",
                {
                    "type": "slide_update",
                    "payload": {
                        "action": "html_generated",
                        "slide_index": index,
                        "file_prefix": file_prefix,
                    }
                }
            )

            return {
                "success": True,
                "message": f"HTML content for slide {index} updated",
                "slide_id": str(slide.id),
                "index": index,
                "html_length": len(html_code),
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
            }


async def update_slide(
    index: int,
    task_brief: str,
    layout: Optional[str] = None,
    file_prefix: Optional[str] = None,
    chat_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Update an existing slide.

    Args:
        index: Slide page index (starts from 1)
        task_brief: Updated task description
        layout: New layout type (optional)
        file_prefix: File name prefix (optional)
        chat_id: Chat ID

    Returns:
        Updated slide information
    """
    async with async_session_maker() as db:
        try:
            if not chat_id:
                return {
                    "success": False,
                    "error": "chat_id is required",
                }

            result = await db.execute(
                select(Slide).where(Slide.chat_id == chat_id, Slide.index == index)
            )
            slide = result.scalar_one_or_none()

            if not slide:
                return {
                    "success": False,
                    "error": f"Slide at index {index} not found",
                }

            # Update fields
            raw_content = slide.raw_content or {}

            if task_brief:
                slide.title = task_brief
                raw_content["task_brief"] = task_brief

            if layout:
                raw_content["layout"] = layout
                layout_info = get_layout_type(layout)
                raw_content["layout_info"] = layout_info

            if file_prefix:
                raw_content["file_prefix"] = file_prefix

            slide.raw_content = raw_content
            await db.commit()

            # Publish update event
            await redis_client.publish(
                f"chat_updates:{chat_id}",
                {
                    "type": "slide_update",
                    "payload": {
                        "action": "update",
                        "slide_index": index,
                        "task_brief": task_brief,
                        "layout": layout,
                    }
                }
            )

            return {
                "success": True,
                "message": f"Slide {index} updated",
                "slide_id": str(slide.id),
                "index": index,
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
            }
