from .auth import router as auth_router
from .projects import router as projects_router
from .slides import router as slides_router
from .agent import router as agent_router

__all__ = [
    "auth_router",
    "projects_router",
    "slides_router",
    "agent_router",
]
