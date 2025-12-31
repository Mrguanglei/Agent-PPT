"""
Image Search Tool
"""
import httpx
from typing import List, Dict, Any, Optional
from app.config import settings


async def search_images(
    query: str,
    num_results: int = 10,
    chat_id: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Search for images related to a topic.

    Args:
        query: Image search query
        num_results: Number of results to return
        chat_id: Optional chat ID for logging

    Returns:
        List of image results with URL, thumbnail, title, and dimensions
    """
    results = []

    # Try Serper Image Search
    if settings.serper_api_key:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://google.serper.dev/images",
                    headers={
                        "X-API-Key": settings.serper_api_key,
                        "Content-Type": "application/json",
                    },
                    json={"q": query, "num": num_results},
                )

                if response.status_code == 200:
                    data = response.json()
                    for item in data.get("images", []):
                        results.append({
                            "url": item.get("imageUrl", ""),
                            "thumbnail": item.get("thumbnailUrl", item.get("imageUrl", "")),
                            "title": item.get("title", ""),
                            "width": item.get("imageWidth", 0),
                            "height": item.get("imageHeight", 0),
                            "source": item.get("sourceUrl", ""),
                        })
        except Exception as e:
            pass

    # Fallback: Unsplash API (free tier)
    if not results:
        try:
            # Note: You would need to add UNSPLASH_ACCESS_KEY to settings
            unsplash_key = getattr(settings, "unsplash_access_key", "")
            if unsplash_key:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.get(
                        "https://api.unsplash.com/search/photos",
                        headers={"Authorization": f"Client-ID {unsplash_key}"},
                        params={"query": query, "per_page": num_results},
                    )

                    if response.status_code == 200:
                        data = response.json()
                        for item in data.get("results", []):
                            results.append({
                                "url": item.get("urls", {}).get("regular", ""),
                                "thumbnail": item.get("urls", {}).get("small", ""),
                                "title": item.get("description") or item.get("alt_description", ""),
                                "width": item.get("width", 0),
                                "height": item.get("height", 0),
                                "source": item.get("links", {}).get("html", ""),
                            })
        except Exception as e:
            pass

    # Development fallback: Mock results
    if not results and settings.is_development:
        for i in range(min(num_results, 10)):
            results.append({
                "url": f"https://picsum.photos/800/600?random={i}",
                "thumbnail": f"https://picsum.photos/400/300?random={i}",
                "title": f"Image result {i + 1} for '{query}'",
                "width": 800,
                "height": 600,
                "source": "https://picsum.photos",
            })

    return results[:num_results]
