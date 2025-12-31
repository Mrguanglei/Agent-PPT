"""
Web Search Tool
"""
import httpx
from typing import List, Dict, Any, Optional
from app.config import settings


async def web_search(
    queries: List[str],
    chat_id: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Search the web for information using Serper API or similar.

    Args:
        queries: List of search query strings
        chat_id: Optional chat ID for logging

    Returns:
        List of search results with title, URL, and snippet
    """
    results = []
    errors = []

    # Try Serper API first (recommended)
    if settings.serper_api_key:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                for query in queries:
                    response = await client.post(
                        "https://google.serper.dev/search",
                        headers={
                            "X-API-Key": settings.serper_api_key,
                            "Content-Type": "application/json",
                        },
                        json={"q": query, "num": 10},
                    )

                    if response.status_code == 200:
                        data = response.json()
                        for item in data.get("organic", []):
                            results.append({
                                "title": item.get("title", ""),
                                "url": item.get("link", ""),
                                "snippet": item.get("snippet", ""),
                                "query": query,
                            })
                    elif response.status_code in [401, 403]:
                        errors.append(f"Serper API returned {response.status_code} - API key may be invalid or quota exceeded")
                    else:
                        errors.append(f"Serper API returned {response.status_code}")
        except Exception as e:
            errors.append(f"Serper API error: {str(e)}")

    # Fallback: Bing Search API
    if not results and settings.bing_search_api_key:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                for query in queries:
                    response = await client.get(
                        "https://api.bing.microsoft.com/v7.0/search",
                        headers={"Ocp-Apim-Subscription-Key": settings.bing_search_api_key},
                        params={"q": query, "count": 10},
                    )

                    if response.status_code == 200:
                        data = response.json()
                        for item in data.get("webPages", {}).get("value", []):
                            results.append({
                                "title": item.get("name", ""),
                                "url": item.get("url", ""),
                                "snippet": item.get("snippet", ""),
                                "query": query,
                            })
                    elif response.status_code in [401, 403]:
                        errors.append(f"Bing API returned {response.status_code} - API key may be invalid")
        except Exception as e:
            errors.append(f"Bing API error: {str(e)}")

    # If no results and there were errors, return error info
    if not results and errors:
        return [{
            "title": "Search Unavailable",
            "url": "",
            "snippet": f"Unable to perform web search. Please configure search API keys (SERPER_API_KEY or BING_SEARCH_API_KEY). Details: {', '.join(errors[:2])}",
            "query": queries[0] if queries else "",
            "error": True,
        }]

    # Final fallback: Mock results for development
    if not results and settings.is_development:
        for query in queries:
            results.append({
                "title": f"Search result for: {query}",
                "url": "https://example.com",
                "snippet": f"This is a mock search result for '{query}'. In production, actual search results will appear here.",
                "query": query,
            })

    return results
