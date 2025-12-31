"""
FastAPI Application Entry Point
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import sentry_sdk
from prometheus_client import make_asgi_app

from app.config import settings
from app.api import auth, chats, agent, streaming


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print(f"🚀 {settings.app_name} is starting...")
    print(f"📦 Environment: {settings.app_env}")
    print(f"🌐 Debug mode: {settings.debug}")

    # Initialize Sentry if in production and DSN is configured
    if settings.is_production and hasattr(settings, 'sentry_dsn') and settings.sentry_dsn:
        sentry_sdk.init(
            dsn=settings.sentry_dsn,
            traces_sample_rate=1.0,
            profiles_sample_rate=1.0,
        )

    yield

    # Shutdown
    print(f"👋 {settings.app_name} is shutting down...")


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="AI-powered PPT generation platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=f"{settings.api_v1_prefix}/auth", tags=["Authentication"])
app.include_router(chats.router, prefix=f"{settings.api_v1_prefix}/chats", tags=["Chats"])
app.include_router(agent.router, prefix=f"{settings.api_v1_prefix}/agent", tags=["Agent"])
app.include_router(streaming.router, prefix=f"{settings.api_v1_prefix}/stream", tags=["Streaming"])


# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app_name": settings.app_name,
        "version": "1.0.0",
        "environment": settings.app_env,
    }


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": f"Welcome to {settings.app_name} API",
        "docs": "/api/docs",
        "health": "/health",
    }


# Global exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    if settings.debug:
        import traceback

        return JSONResponse(
            status_code=500,
            content={
                "detail": str(exc),
                "type": type(exc).__name__,
                "traceback": traceback.format_exc(),
            },
        )
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="debug" if settings.debug else "info",
    )
