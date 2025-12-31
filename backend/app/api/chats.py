"""
Chats API Routes
"""
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.chat import Chat
from app.models.message import Message
from app.models.slide import Slide
from app.models.user import User
from app.schemas.chat import ChatCreate, ChatUpdate, ChatResponse, ChatListResponse
from app.api.deps import get_current_active_user, optional_auth

router = APIRouter()


@router.get("", response_model=ChatListResponse)
async def list_chats(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str | None = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    List all chats for the current user

    - **page**: Page number (starts from 1)
    - **page_size**: Number of items per page (max 100)
    - **status**: Filter by chat status (optional)
    """
    # Build query
    query = select(Chat).where(Chat.user_id == current_user.id)

    if status:
        query = query.where(Chat.status == status)

    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Get paginated results with relationships
    query = (
        query.order_by(Chat.updated_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .options(selectinload(Chat.messages))
        .options(selectinload(Chat.slides))
    )

    result = await db.execute(query)
    chats = result.scalars().all()

    # Enrich with counts
    chat_responses = []
    for chat in chats:
        chat_dict = ChatResponse.model_validate(chat).model_dump()
        chat_dict["message_count"] = len(chat.messages)
        chat_dict["slide_count"] = len(chat.slides)
        chat_responses.append(ChatResponse(**chat_dict))

    return ChatListResponse(
        chats=chat_responses,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=ChatResponse, status_code=status.HTTP_201_CREATED)
async def create_chat(
    chat_in: ChatCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Create a new chat

    - **title**: Optional chat title (will be auto-generated from first message if not provided)
    """
    chat = Chat(
        user_id=current_user.id,
        title=chat_in.title,
    )

    db.add(chat)
    await db.commit()
    await db.refresh(chat)

    return ChatResponse(
        **chat.__dict__,
        message_count=0,
        slide_count=0,
    )


@router.get("/{chat_id}")
async def get_chat(
    chat_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Get a specific chat by ID with messages

    Includes full message list and slide counts.
    """
    result = await db.execute(
        select(Chat)
        .where(Chat.id == chat_id, Chat.user_id == current_user.id)
        .options(selectinload(Chat.messages))
        .options(selectinload(Chat.slides))
    )
    chat = result.scalar_one_or_none()

    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found",
        )

    # Convert chat to dict and add messages
    chat_dict = {
        **ChatResponse.model_validate(chat).model_dump(),
        "message_count": len(chat.messages),
        "slide_count": len(chat.slides),
        "messages": [
            {
                "id": msg.id,
                "chat_id": msg.chat_id,
                "role": msg.role.value,
                "content": msg.content,
                "created_at": msg.created_at.isoformat(),
                "updated_at": msg.updated_at.isoformat(),
            }
            for msg in chat.messages
        ]
    }

    return chat_dict


@router.patch("/{chat_id}", response_model=ChatResponse)
async def update_chat(
    chat_id: str,
    chat_in: ChatUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Update a chat (rename, change status, etc.)

    - **title**: New chat title
    - **status**: New chat status
    """
    result = await db.execute(
        select(Chat).where(Chat.id == chat_id, Chat.user_id == current_user.id)
    )
    chat = result.scalar_one_or_none()

    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found",
        )

    # Update fields
    if chat_in.title is not None:
        chat.title = chat_in.title
    if chat_in.status is not None:
        chat.status = chat_in.status

    await db.commit()
    await db.refresh(chat)

    # Get counts
    messages_result = await db.execute(
        select(func.count()).select_from(Message).where(Message.chat_id == chat_id)
    )
    slides_result = await db.execute(
        select(func.count()).select_from(Slide).where(Slide.chat_id == chat_id)
    )

    return ChatResponse(
        **chat.__dict__,
        message_count=messages_result.scalar() or 0,
        slide_count=slides_result.scalar() or 0,
    )


@router.delete("/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chat(
    chat_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """
    Delete a chat and all associated data (messages, tool_calls, slides)
    """
    result = await db.execute(
        select(Chat).where(Chat.id == chat_id, Chat.user_id == current_user.id)
    )
    chat = result.scalar_one_or_none()

    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found",
        )

    await db.delete(chat)
    await db.commit()
