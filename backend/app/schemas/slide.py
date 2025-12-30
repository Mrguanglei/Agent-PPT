from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID


class SlideBase(BaseModel):
    index: int = Field(ge=0)
    html_content: str
    style_config: Optional[Dict[str, Any]] = {}


class SlideCreate(SlideBase):
    pass


class SlideUpdate(BaseModel):
    html_content: Optional[str] = None
    style_config: Optional[Dict[str, Any]] = None


class SlideInDB(SlideBase):
    id: UUID
    project_id: UUID
    thumbnail_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Slide(SlideInDB):
    assets: Optional[List["SlideAsset"]] = []

    class Config:
        from_attributes = True


class SlideAssetBase(BaseModel):
    asset_type: str = Field(min_length=1, max_length=50)
    asset_url: str = Field(min_length=1, max_length=500)
    source_query: Optional[str] = None
    meta_data: Optional[Dict[str, Any]] = {}


class SlideAssetCreate(SlideAssetBase):
    pass


class SlideAssetUpdate(BaseModel):
    asset_url: Optional[str] = Field(None, min_length=1, max_length=500)
    source_query: Optional[str] = None
    meta_data: Optional[Dict[str, Any]] = None


class SlideAssetInDB(SlideAssetBase):
    id: UUID
    slide_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class SlideAsset(SlideAssetInDB):
    pass


# 解决循环引用
Slide.update_forward_refs()
