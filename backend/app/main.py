from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
import logging
import sentry_sdk

from app.config import settings
from app.api import auth_router, projects_router, slides_router, agent_router
from app.database import engine
from app.models.base import Base

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 初始化 Sentry
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.APP_ENV,
        traces_sample_rate=1.0,
        profiles_sample_rate=1.0,
    )

# 创建 FastAPI 应用
app = FastAPI(
    title="PPT Agent API",
    version="1.0.0",
    description="智能 PPT 生成平台 API",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gzip 压缩
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Prometheus 指标 (可选)
if settings.ENABLE_METRICS:
    from prometheus_fastapi_instrumentator import Instrumentator

    @app.on_event("startup")
    async def startup():
        Instrumentator().instrument(app).expose(app)

# 全局异常处理
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# 健康检查
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# 路由注册
app.include_router(auth_router, prefix="/api/auth", tags=["认证"])
app.include_router(projects_router, prefix="/api/projects", tags=["项目"])
app.include_router(slides_router, prefix="/api/slides", tags=["幻灯片"])
app.include_router(agent_router, prefix="/api/agent", tags=["Agent"])

# 启动事件
@app.on_event("startup")
async def startup_event():
    logger.info("Application starting up...")
    # 创建数据库表
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# 关闭事件
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Application shutting down...")
