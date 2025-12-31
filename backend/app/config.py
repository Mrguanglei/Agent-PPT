"""
Application Configuration
"""
from typing import List
from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import Field, validator


class Settings(BaseSettings):
    """Application Settings"""

    # Application
    app_name: str = "PPT Agent"
    app_env: str = Field(default="development", pattern="^(development|staging|production)$")
    debug: bool = False
    api_v1_prefix: str = "/api/v1"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # Database
    database_url: str = Field(
        default="postgresql+asyncpg://ppt_agent:ppt_agent_password@localhost:5432/ppt_agent"
    )

    # Redis
    redis_url: str = Field(default="redis://localhost:6379/0")

    # OpenAI / Compatible API (支持国产模型)
    openai_api_key: str = Field(..., env="OPENAI_API_KEY")
    openai_base_url: str = Field(default="", env="OPENAI_BASE_URL")  # 自定义API地址，如智谱、通义千问等
    openai_model: str = Field(default="gpt-4-turbo-preview", env="OPENAI_MODEL")  # 模型名称
    openai_temperature: float = 0.7
    openai_max_tokens: int = 4096

    # JWT
    secret_key: str = Field(..., env="SECRET_KEY")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # CORS
    cors_origins: List[str] = Field(
        default=["http://localhost:3000", "http://127.0.0.1:3000"]
    )

    # MinIO
    minio_endpoint: str = "localhost:9000"
    minio_access_key: str = "minioadmin"
    minio_secret_key: str = "minioadmin"
    minio_bucket: str = "ppt-agent"
    minio_secure: bool = False

    # Search APIs
    serper_api_key: str = Field(default="", env="SERPER_API_KEY")
    bing_search_api_key: str = Field(default="", env="BING_SEARCH_API_KEY")

    @validator("cors_origins", pre=True)
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def is_development(self) -> bool:
        return self.app_env == "development"

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()
