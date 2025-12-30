from typing import List, Dict, Any
import httpx
from app.config import settings
import logging

logger = logging.getLogger(__name__)


async def web_search(
    queries: List[str],
    recency_days: int = -1,
    project_id: str = None
) -> List[Dict[str, Any]]:
    """
    搜索网页信息

    Args:
        queries: 搜索查询列表
        recency_days: 搜索最近几天的内容，-1表示全部时间
        project_id: 项目ID（用于日志记录）

    Returns:
        搜索结果列表
    """
    try:
        all_results = []

        async with httpx.AsyncClient(timeout=30.0) as client:
            for query in queries:
                # 构建搜索参数
                params = {
                    "engine": "google",
                    "q": query,
                    "num": 10,
                    "api_key": settings.SERPAPI_KEY
                }

                # 添加时间限制
                if recency_days > 0:
                    params["tbs"] = f"qdr:d{max(recency_days, 1)}"

                response = await client.get(
                    "https://serpapi.com/search",
                    params=params
                )

                if response.status_code != 200:
                    logger.error(f"SerpAPI web search error: {response.text}")
                    continue

                data = response.json()
                results = []

                for item in data.get("organic_results", [])[:5]:  # 每个查询取前5个结果
                    results.append({
                        "title": item.get("title", ""),
                        "link": item.get("link", ""),
                        "snippet": item.get("snippet", ""),
                        "display_link": item.get("displayed_link", ""),
                        "query": query
                    })

                all_results.extend(results)
                logger.info(f"Found {len(results)} results for query: {query}")

        return all_results

    except Exception as e:
        logger.error(f"Web search error: {e}", exc_info=True)
        return []
