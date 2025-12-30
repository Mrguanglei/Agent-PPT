from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """认证服务"""

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """验证密码"""
        # bcrypt限制密码不能超过72字节，截断过长的密码进行验证
        truncated_password = plain_password[:72]  # 简单截断前72个字符
        return pwd_context.verify(truncated_password, hashed_password)

    @staticmethod
    def get_password_hash(password: str) -> str:
        """获取密码哈希"""
        # bcrypt限制密码不能超过72字节，截断过长的密码
        truncated_password = password[:72]  # 简单截断前72个字符
        return pwd_context.hash(truncated_password)

    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
        """创建访问令牌"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt

    @classmethod
    async def authenticate_user(cls, db: AsyncSession, email: str, password: str) -> Optional[User]:
        """认证用户"""
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if not user:
            return None
        if not cls.verify_password(password, user.password_hash):
            return None
        return user

    @classmethod
    async def create_user(cls, db: AsyncSession, user_data: UserCreate) -> User:
        """创建用户"""
        # 检查邮箱是否已存在
        result = await db.execute(select(User).where(User.email == user_data.email))
        if result.scalar_one_or_none():
            raise ValueError("Email already registered")

        # 创建用户
        hashed_password = cls.get_password_hash(user_data.password)
        user = User(
            email=user_data.email,
            username=user_data.username,
            password_hash=hashed_password
        )

        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    @classmethod
    async def get_user_by_email(cls, db: AsyncSession, email: str) -> Optional[User]:
        """通过邮箱获取用户"""
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    @classmethod
    async def get_user_by_id(cls, db: AsyncSession, user_id: str) -> Optional[User]:
        """通过ID获取用户"""
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()
