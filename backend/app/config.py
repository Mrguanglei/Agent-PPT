from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    """应用配置"""

    # 应用基础配置
    APP_NAME: str = "PPT Agent"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # 服务器配置
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # 数据库配置
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost/ppt_agent"

    # Redis 配置
    REDIS_URL: str = "redis://localhost:16379/0"

    # JWT 配置
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # OpenAI 配置
    OPENAI_API_KEY: str = ""
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    OPENAI_MODEL: str = "gpt-4-turbo-preview"

    # SerpAPI 配置 (图片搜索)
    SERPAPI_KEY: str = ""

    # CORS 配置
    CORS_ORIGINS: List[str] = [
        "http://localhost:8090",
        "http://localhost:5173",
        "https://localhost:8090",
        "https://localhost:5173",
    ]

    # 文件上传配置
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR: str = "/tmp/uploads"

    # MinIO 配置 (对象存储)
    MINIO_ENDPOINT: str = "localhost:19000"
    MINIO_ACCESS_KEY: str = ""
    MINIO_SECRET_KEY: str = ""
    MINIO_SECURE: bool = False
    MINIO_BUCKET: str = "ppt-agent"

    # Celery 配置
    CELERY_BROKER_URL: str = REDIS_URL
    CELERY_RESULT_BACKEND: str = REDIS_URL

    # 监控配置
    SENTRY_DSN: str = ""
    APP_ENV: str = "development"

    # Prometheus 指标
    ENABLE_METRICS: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
