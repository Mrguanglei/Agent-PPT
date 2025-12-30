import pytest
from httpx import AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_register():
    """测试用户注册"""
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        response = await client.post(
            "/api/auth/register",
            json={
                "email": "test@example.com",
                "username": "testuser",
                "password": "testpassword"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["username"] == "testuser"


@pytest.mark.asyncio
async def test_login():
    """测试用户登录"""
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        # 先注册用户
        await client.post(
            "/api/auth/register",
            json={
                "email": "login@example.com",
                "username": "loginuser",
                "password": "loginpassword"
            }
        )

        # 登录
        response = await client.post(
            "/api/auth/login",
            data={
                "username": "login@example.com",
                "password": "loginpassword"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
