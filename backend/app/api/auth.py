"""
Authentication API Routes
"""
from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token, UserLogin
from app.utils.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    generate_random_token,
)
from app.api.deps import get_current_active_user
from app.config import settings

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Register a new user

    - **email**: User email (must be unique)
    - **username**: Display name
    - **password**: Password (min 8 characters)
    """
    # Check if user exists
    result = await db.execute(select(User).where(User.email == user_in.email))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists",
        )

    # Create user
    user = User(
        email=user_in.email,
        username=user_in.username,
        password_hash=get_password_hash(user_in.password),
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return user


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Login with OAuth2 compatible token

    - **username**: Email address
    - **password**: Password
    """
    # Find user
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalar_one_or_none()

    # Verify password
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=access_token_expires,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.post("/token", response_model=Token)
async def login_token(
    user_login: UserLogin,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Alternative login endpoint with JSON body

    - **email**: Email address
    - **password**: Password
    """
    # Find user
    result = await db.execute(select(User).where(User.email == user_login.email))
    user = result.scalar_one_or_none()

    # Verify password
    if not user or not verify_password(user_login.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=access_token_expires,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get current user information

    Requires authentication.
    """
    return current_user


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Logout endpoint

    Note: In a stateless JWT setup, logout is handled client-side
    by deleting the token. This endpoint can be used to:
    1. Add token to blacklist (if implementing blacklist)
    2. Log the logout event
    3. Perform any cleanup
    """
    return {"message": "Successfully logged out"}
