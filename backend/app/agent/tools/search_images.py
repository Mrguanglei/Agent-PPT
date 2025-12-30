from typing import List, Dict, Any
import httpx
from app.config import settings
import logging

logger = logging.getLogger(__name__)


async def search_images(
    query: str,
    gl: str = "cn",
    rank: bool = True,
    project_id: str = None
) -> List[Dict[str, Any]]:
    """
    搜索图片

    Args:
        query: 搜索查询
        gl: 国家代码
        rank: 是否使用AI排序
        project_id: 项目ID（用于日志记录）

    Returns:
        图片结果列表
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                "https://serpapi.com/search",
                params={
                    "engine": "google_images",
                    "q": query,
                    "gl": gl,
                    "num": 10,
                    "api_key": settings.SERPAPI_KEY
                }
            )

            if response.status_code != 200:
                logger.error(f"SerpAPI error: {response.text}")
                return []

            data = response.json()
            images = []

            for item in data.get("images_results", [])[:10]:
                images.append({
                    "url": item.get("original"),
                    "thumbnail": item.get("thumbnail"),
                    "title": item.get("title", ""),
                    "source": item.get("source", ""),
                    "width": item.get("original_width"),
                    "height": item.get("original_height")
                })

            logger.info(f"Found {len(images)} images for query: {query}")
            return images

    except Exception as e:
        logger.error(f"Image search error: {e}", exc_info=True)
        return []
