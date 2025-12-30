from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID
from app.database import get_db
from app.services.project_service import ProjectService
from app.schemas.project import Project, ProjectCreate, ProjectUpdate, ProjectWithSlides
from app.models.user import User
from app.dependencies import get_current_active_user


router = APIRouter()


@router.post("/", response_model=Project)
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """创建项目"""
    project = await ProjectService.create_project(db, current_user.id, project_data)
    return Project.from_orm(project)


@router.get("/", response_model=List[Project])
async def get_projects(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """获取用户项目列表"""
    projects = await ProjectService.get_projects_by_user(db, current_user.id)
    return [Project.from_orm(project) for project in projects]


@router.get("/{project_id}", response_model=Project)
async def get_project(
    project_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """获取项目详情"""
    project = await ProjectService.get_project(db, project_id, current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return Project.from_orm(project)


@router.put("/{project_id}", response_model=Project)
async def update_project(
    project_id: UUID,
    project_data: ProjectUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """更新项目"""
    project = await ProjectService.update_project(db, project_id, current_user.id, project_data)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return Project.from_orm(project)


@router.delete("/{project_id}")
async def delete_project(
    project_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """删除项目"""
    success = await ProjectService.delete_project(db, project_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return {"message": "Project deleted successfully"}
