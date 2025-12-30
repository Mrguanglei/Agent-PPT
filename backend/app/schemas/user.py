from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(min_length=1, max_length=100)


class UserCreate(UserBase):
    password: str = Field(min_length=6, max_length=72)


class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    avatar_url: Optional[str] = None


class UserInDB(UserBase):
    id: UUID
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class User(UserInDB):
    """用于返回给前端的用户信息（不包含敏感信息）"""
    pass


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    sub: Optional[str] = None
