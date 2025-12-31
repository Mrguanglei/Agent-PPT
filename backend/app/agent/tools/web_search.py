"""
Web Search Tool - Using Bocha API
"""
import httpx
from typing import List, Dict, Any, Optional
from app.config import settings


async def web_search(
    queries: List[str],
    chat_id: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Search the web for information using Bocha API.

    Args:
        queries: List of search query strings
        chat_id: Optional chat ID for logging

    Returns:
        List of search results with title, URL, snippet, and metadata
    """
    results = []

    # Get API key from environment
    api_key = getattr(settings, 'bocha_api_key', None) or getattr(settings, 'serper_api_key', None)

    if not api_key:
        return [{
            "title": "搜索不可用",
            "url": "",
            "snippet": "未配置博查API密钥 (BOCHA_API_KEY)。请在.env文件中添加API密钥。",
            "query": queries[0] if queries else "",
            "error": True,
        }]

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            for query in queries:
                response = await client.post(
                    "https://api.bocha.cn/v1/web-search",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "query": query,
                        "freshness": "noLimit",
                        "summary": True,
                        "count": 10
                    },
                )

                if response.status_code == 200:
                    data = response.json()
                    web_pages = data.get("data", {}).get("webPages", {}).get("value", [])

                    for item in web_pages:
                        results.append({
                            "title": item.get("name", ""),
                            "url": item.get("url", ""),
                            "snippet": item.get("snippet", ""),
                            "displayUrl": item.get("displayUrl", ""),
                            "siteName": item.get("siteName", ""),
                            "siteIcon": item.get("siteIcon", ""),
                            "dateLastCrawled": item.get("dateLastCrawled", ""),
                            "query": query,
                        })
                else:
                    # API error
                    results.append({
                        "title": "搜索失败",
                        "url": "",
                        "snippet": f"博查API返回错误: {response.status_code}",
                        "query": query,
                        "error": True,
                    })
    except Exception as e:
        return [{
            "title": "搜索错误",
            "url": "",
            "snippet": f"搜索时发生错误: {str(e)}",
            "query": queries[0] if queries else "",
            "error": True,
        }]

    return results
