from typing import Dict, Any
import httpx
from bs4 import BeautifulSoup
import logging

logger = logging.getLogger(__name__)


async def visit_page(url: str, project_id: str = None) -> Dict[str, Any]:
    """
    访问网页获取详细内容

    Args:
        url: 要访问的网页URL
        project_id: 项目ID（用于日志记录）

    Returns:
        页面内容字典
    """
    try:
        async with httpx.AsyncClient(
            timeout=30.0,
            follow_redirects=True,
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        ) as client:
            response = await client.get(url)

            if response.status_code != 200:
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}",
                    "url": url
                }

            # 解析HTML内容
            soup = BeautifulSoup(response.text, 'html.parser')

            # 提取标题
            title = ""
            if soup.title:
                title = soup.title.string.strip() if soup.title.string else ""

            # 提取主要内容
            content = ""

            # 尝试不同的内容选择器
            content_selectors = [
                'article',
                '[class*="content"]',
                '[class*="article"]',
                '[class*="post"]',
                'main',
                '.main-content',
                '#content',
                '#main'
            ]

            for selector in content_selectors:
                content_element = soup.select_one(selector)
                if content_element:
                    content = content_element.get_text(separator='\n', strip=True)
                    break

            # 如果没有找到特定内容，提取body文本
            if not content:
                body = soup.body
                if body:
                    content = body.get_text(separator='\n', strip=True)

            # 清理内容
            content = ' '.join(content.split())  # 移除多余的空白字符
            content = content[:10000]  # 限制内容长度

            result = {
                "success": True,
                "url": url,
                "title": title,
                "content": content,
                "status_code": response.status_code
            }

            logger.info(f"Successfully visited page: {url}")
            return result

    except Exception as e:
        logger.error(f"Visit page error for {url}: {e}", exc_info=True)
        return {
            "success": False,
            "error": str(e),
            "url": url
        }
