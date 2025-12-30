"""
Celery异步任务配置
"""
from celery import Celery
from app.config import settings

# 创建Celery应用实例
celery_app = Celery(
    "ppt_agent",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks"]
)

# Celery配置
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

# 导入任务模块
try:
    import app.tasks
except ImportError:
    pass

if __name__ == "__main__":
    celery_app.start()
