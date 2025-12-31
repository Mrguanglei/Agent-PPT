"""
Visit Page Tool - Extract content from a specific URL
"""
import httpx
from typing import Dict, Any, Optional
from bs4 import BeautifulSoup


async def visit_page(
    url: str,
    chat_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Visit a specific webpage and extract its content.

    Args:
        url: The URL to visit
        chat_id: Optional chat ID for logging

    Returns:
        Dictionary with title, content, and metadata
    """
    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
            response = await client.get(url, headers=headers)

            if response.status_code != 200:
                return {
                    "error": f"Failed to fetch page: HTTP {response.status_code}",
                    "url": url,
                }

            # Parse HTML
            soup = BeautifulSoup(response.text, "html.parser")

            # Extract title
            title = soup.find("title")
            title_text = title.get_text() if title else "No title found"

            # Remove script and style elements
            for script in soup(["script", "style", "nav", "footer", "header"]):
                script.decompose()

            # Extract main content
            content_tags = soup.find_all(["p", "h1", "h2", "h3", "h4", "h5", "h6", "li"])
            content_parts = []
            for tag in content_tags:
                text = tag.get_text(strip=True)
                if text:
                    content_parts.append(text)

            content_text = "\n\n".join(content_parts[:50])  # Limit to first 50 elements

            # Extract meta description
            meta_desc = soup.find("meta", attrs={"name": "description"})
            description = meta_desc.get("content", "") if meta_desc else ""

            return {
                "url": url,
                "title": title_text,
                "description": description,
                "content": content_text[:5000],  # Limit content length
                "word_count": len(content_text.split()),
            }

    except Exception as e:
        return {
            "error": str(e),
            "url": url,
        }
