from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID
from app.database import get_db
from app.services.slide_service import SlideService, SlideAssetService
from app.schemas.slide import Slide, SlideCreate, SlideUpdate, SlideAsset, SlideAssetCreate, SlideAssetUpdate
from app.models.user import User
from app.dependencies import get_current_active_user
from app.services.project_service import ProjectService


router = APIRouter()


@router.post("/", response_model=Slide)
async def create_slide(
    project_id: UUID,
    slide_data: SlideCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """创建幻灯片"""
    # 检查项目是否存在且属于当前用户
    project = await ProjectService.get_project(db, project_id, current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    slide = await SlideService.create_slide(db, project_id, slide_data)
    return Slide.from_orm(slide)


@router.get("/", response_model=List[Slide])
async def get_slides(
    project_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """获取项目幻灯片列表"""
    # 检查项目是否存在且属于当前用户
    project = await ProjectService.get_project(db, project_id, current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    slides = await SlideService.get_slides_by_project(db, project_id)
    return [Slide.from_orm(slide) for slide in slides]


@router.get("/{slide_id}", response_model=Slide)
async def get_slide(
    slide_id: UUID,
    project_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """获取幻灯片详情"""
    slide = await SlideService.get_slide(db, slide_id, project_id)
    if not slide:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slide not found"
        )

    # 检查项目权限
    project = await ProjectService.get_project(db, project_id, current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    return Slide.from_orm(slide)


@router.put("/{slide_id}", response_model=Slide)
async def update_slide(
    slide_id: UUID,
    project_id: UUID,
    slide_data: SlideUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """更新幻灯片"""
    # 检查项目权限
    project = await ProjectService.get_project(db, project_id, current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    slide = await SlideService.update_slide(db, slide_id, project_id, slide_data)
    if not slide:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slide not found"
        )

    return Slide.from_orm(slide)


@router.delete("/{slide_id}")
async def delete_slide(
    slide_id: UUID,
    project_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """删除幻灯片"""
    # 检查项目权限
    project = await ProjectService.get_project(db, project_id, current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    success = await SlideService.delete_slide(db, slide_id, project_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slide not found"
        )

    return {"message": "Slide deleted successfully"}


# 素材相关路由
@router.post("/{slide_id}/assets", response_model=SlideAsset)
async def create_asset(
    slide_id: UUID,
    project_id: UUID,
    asset_data: SlideAssetCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """创建素材"""
    # 检查项目权限
    project = await ProjectService.get_project(db, project_id, current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # 检查幻灯片是否存在
    slide = await SlideService.get_slide(db, slide_id, project_id)
    if not slide:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slide not found"
        )

    asset = await SlideAssetService.create_asset(db, slide_id, asset_data)
    return SlideAsset.from_orm(asset)


@router.get("/{slide_id}/assets", response_model=List[SlideAsset])
async def get_assets(
    slide_id: UUID,
    project_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """获取幻灯片素材列表"""
    # 检查项目权限
    project = await ProjectService.get_project(db, project_id, current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    assets = await SlideAssetService.get_assets_by_slide(db, slide_id)
    return [SlideAsset.from_orm(asset) for asset in assets]


@router.put("/{slide_id}/assets/{asset_id}", response_model=SlideAsset)
async def update_asset(
    slide_id: UUID,
    asset_id: UUID,
    project_id: UUID,
    asset_data: SlideAssetUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """更新素材"""
    # 检查项目权限
    project = await ProjectService.get_project(db, project_id, current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    asset = await SlideAssetService.update_asset(db, asset_id, slide_id, asset_data)
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )

    return SlideAsset.from_orm(asset)


@router.delete("/{slide_id}/assets/{asset_id}")
async def delete_asset(
    slide_id: UUID,
    asset_id: UUID,
    project_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """删除素材"""
    # 检查项目权限
    project = await ProjectService.get_project(db, project_id, current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    success = await SlideAssetService.delete_asset(db, asset_id, slide_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )

    return {"message": "Asset deleted successfully"}
