from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from uuid import UUID
from app.models.slide import Slide, SlideAsset
from app.schemas.slide import SlideCreate, SlideUpdate, SlideAssetCreate, SlideAssetUpdate


class SlideService:
    """幻灯片服务"""

    @classmethod
    async def create_slide(
        cls,
        db: AsyncSession,
        project_id: UUID,
        slide_data: SlideCreate
    ) -> Slide:
        """创建幻灯片"""
        slide = Slide(
            project_id=project_id,
            index=slide_data.index,
            html_content=slide_data.html_content,
            style_config=slide_data.style_config
        )

        db.add(slide)
        await db.commit()
        await db.refresh(slide)
        return slide

    @classmethod
    async def get_slide(cls, db: AsyncSession, slide_id: UUID, project_id: UUID) -> Optional[Slide]:
        """获取幻灯片"""
        result = await db.execute(
            select(Slide).where(
                Slide.id == slide_id,
                Slide.project_id == project_id
            )
        )
        return result.scalar_one_or_none()

    @classmethod
    async def get_slides_by_project(cls, db: AsyncSession, project_id: UUID) -> List[Slide]:
        """获取项目的幻灯片列表"""
        result = await db.execute(
            select(Slide).where(Slide.project_id == project_id).order_by(Slide.index)
        )
        return list(result.scalars().all())

    @classmethod
    async def update_slide(
        cls,
        db: AsyncSession,
        slide_id: UUID,
        project_id: UUID,
        slide_data: SlideUpdate
    ) -> Optional[Slide]:
        """更新幻灯片"""
        # 获取幻灯片
        slide = await cls.get_slide(db, slide_id, project_id)
        if not slide:
            return None

        # 更新字段
        update_data = slide_data.dict(exclude_unset=True)
        if update_data:
            await db.execute(
                update(Slide)
                .where(Slide.id == slide_id, Slide.project_id == project_id)
                .values(**update_data)
            )
            await db.commit()
            await db.refresh(slide)

        return slide

    @classmethod
    async def delete_slide(cls, db: AsyncSession, slide_id: UUID, project_id: UUID) -> bool:
        """删除幻灯片"""
        result = await db.execute(
            delete(Slide).where(
                Slide.id == slide_id,
                Slide.project_id == project_id
            )
        )
        await db.commit()
        return result.rowcount > 0

    @classmethod
    async def reorder_slides(
        cls,
        db: AsyncSession,
        project_id: UUID,
        slide_orders: List[dict]
    ) -> bool:
        """重新排序幻灯片"""
        try:
            for order_data in slide_orders:
                await db.execute(
                    update(Slide)
                    .where(Slide.id == order_data["id"], Slide.project_id == project_id)
                    .values(index=order_data["index"])
                )
            await db.commit()
            return True
        except Exception:
            await db.rollback()
            return False


class SlideAssetService:
    """幻灯片素材服务"""

    @classmethod
    async def create_asset(
        cls,
        db: AsyncSession,
        slide_id: UUID,
        asset_data: SlideAssetCreate
    ) -> SlideAsset:
        """创建素材"""
        asset = SlideAsset(
            slide_id=slide_id,
            asset_type=asset_data.asset_type,
            asset_url=asset_data.asset_url,
            source_query=asset_data.source_query,
            metadata=asset_data.metadata
        )

        db.add(asset)
        await db.commit()
        await db.refresh(asset)
        return asset

    @classmethod
    async def get_assets_by_slide(cls, db: AsyncSession, slide_id: UUID) -> List[SlideAsset]:
        """获取幻灯片的素材列表"""
        result = await db.execute(
            select(SlideAsset).where(SlideAsset.slide_id == slide_id)
        )
        return list(result.scalars().all())

    @classmethod
    async def update_asset(
        cls,
        db: AsyncSession,
        asset_id: UUID,
        slide_id: UUID,
        asset_data: SlideAssetUpdate
    ) -> Optional[SlideAsset]:
        """更新素材"""
        result = await db.execute(
            select(SlideAsset).where(
                SlideAsset.id == asset_id,
                SlideAsset.slide_id == slide_id
            )
        )
        asset = result.scalar_one_or_none()
        if not asset:
            return None

        update_data = asset_data.dict(exclude_unset=True)
        if update_data:
            await db.execute(
                update(SlideAsset)
                .where(SlideAsset.id == asset_id, SlideAsset.slide_id == slide_id)
                .values(**update_data)
            )
            await db.commit()
            await db.refresh(asset)

        return asset

    @classmethod
    async def delete_asset(cls, db: AsyncSession, asset_id: UUID, slide_id: UUID) -> bool:
        """删除素材"""
        result = await db.execute(
            delete(SlideAsset).where(
                SlideAsset.id == asset_id,
                SlideAsset.slide_id == slide_id
            )
        )
        await db.commit()
        return result.rowcount > 0
