"""
API Dependencies
"""
import uuid
from typing import AsyncGenerator, Optional
from fastapi import Depends, HTTPException, status, Query, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User
from app.schemas.user import TokenData
from app.utils.security import decode_access_token

# OAuth2 scheme for token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def get_token_from_request(request: Request) -> Optional[str]:
    """Extract token from Authorization header or query parameter"""
    # Try header first
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:]  # Remove "Bearer " prefix

    # Try query parameter
    token = request.query_params.get("token")
    return token


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Get current authenticated user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Decode token
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id_str: Optional[str] = payload.get("sub")
    if user_id_str is None:
        raise credentials_exception

    # Convert string UUID to UUID object
    try:
        user_id = uuid.UUID(user_id_str)
    except (ValueError, AttributeError):
        raise credentials_exception

    # Get user from database
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )
    return current_user


async def get_current_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    """Get current superuser"""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User doesn't have enough privileges",
        )
    return current_user


class OptionalAuth:
    """Optional authentication dependency"""

    async def __call__(
        self,
        db: AsyncSession = Depends(get_db),
        token: Optional[str] = Depends(
            OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)
        ),
    ) -> Optional[User]:
        """Get user if token is provided, otherwise return None"""
        if token is None:
            return None

        try:
            payload = decode_access_token(token)
            if payload is None:
                return None

            user_id_str: Optional[str] = payload.get("sub")
            if user_id_str is None:
                return None

            # Convert string UUID to UUID object
            user_id = uuid.UUID(user_id_str)

            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()

            if user and user.is_active:
                return user
        except Exception:
            pass

        return None


optional_auth = OptionalAuth()


async def get_current_user_from_token(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Get current authenticated user from JWT token.
    Supports token from Authorization header or query parameter.
    """
    import logging
    logger = logging.getLogger(__name__)

    # Extract token from header or query parameter
    auth_token = get_token_from_request(request)

    if not auth_token:
        logger.warning("No token found in header or query parameter")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Decode token
    payload = decode_access_token(auth_token)
    if payload is None:
        raise credentials_exception

    user_id_str: Optional[str] = payload.get("sub")
    if user_id_str is None:
        raise credentials_exception

    # Convert string UUID to UUID object
    try:
        user_id = uuid.UUID(user_id_str)
    except (ValueError, AttributeError):
        raise credentials_exception

    # Get user from database
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    return user

