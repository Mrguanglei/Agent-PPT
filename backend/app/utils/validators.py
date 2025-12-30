from typing import Dict, Any, List
import re
from urllib.parse import urlparse


class DataValidator:
    """数据验证工具"""

    @staticmethod
    def is_valid_email(email: str) -> bool:
        """验证邮箱格式"""
        if not email:
            return False

        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))

    @staticmethod
    def is_valid_url(url: str) -> bool:
        """验证URL格式"""
        if not url:
            return False

        try:
            result = urlparse(url)
            return all([result.scheme, result.netloc])
        except:
            return False

    @staticmethod
    def is_valid_html(html: str) -> bool:
        """验证HTML内容"""
        if not html or not isinstance(html, str):
            return False

        # 检查基本HTML结构
        html = html.strip()
        if not html:
            return False

        # 检查是否有基本的HTML标签
        return '<' in html and '>' in html

    @staticmethod
    def sanitize_string(text: str, max_length: int = 1000) -> str:
        """清理字符串"""
        if not text:
            return ""

        # 移除多余空白字符
        text = re.sub(r'\s+', ' ', text.strip())

        # 限制长度
        if len(text) > max_length:
            text = text[:max_length] + "..."

        return text

    @staticmethod
    def validate_project_config(config: Dict[str, Any]) -> Dict[str, Any]:
        """验证项目配置"""
        validated_config = {}

        # 验证slide_num
        slide_num = config.get('slide_num', 5)
        if isinstance(slide_num, int) and 1 <= slide_num <= 50:
            validated_config['slide_num'] = slide_num
        else:
            validated_config['slide_num'] = 5

        # 验证width和height
        width = config.get('width', 1280)
        height = config.get('height', 720)

        if isinstance(width, int) and 800 <= width <= 1920:
            validated_config['width'] = width
        else:
            validated_config['width'] = 1280

        if isinstance(height, int) and 600 <= height <= 1080:
            validated_config['height'] = height
        else:
            validated_config['height'] = 720

        # 验证slide_name
        slide_name = config.get('slide_name', 'presentation')
        if isinstance(slide_name, str) and len(slide_name) <= 100:
            validated_config['slide_name'] = slide_name
        else:
            validated_config['slide_name'] = 'presentation'

        return validated_config

    @staticmethod
    def validate_slide_content(content: str) -> str:
        """验证幻灯片内容"""
        if not content:
            return ""

        # 清理HTML
        from .html_processor import HTMLProcessor
        content = HTMLProcessor.sanitize_html(content)

        # 验证结构
        if not HTMLProcessor.validate_html_structure(content):
            # 如果HTML无效，返回纯文本包装
            content = f"<div>{content}</div>"

        return content

    @staticmethod
    def validate_image_url(url: str) -> bool:
        """验证图片URL"""
        if not DataValidator.is_valid_url(url):
            return False

        # 检查是否是常见的图片格式
        image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
        url_lower = url.lower()

        return any(url_lower.endswith(ext) for ext in image_extensions)

    @staticmethod
    def validate_search_query(query: str) -> str:
        """验证搜索查询"""
        if not query or not isinstance(query, str):
            return ""

        # 清理查询
        query = DataValidator.sanitize_string(query, 200)

        # 移除特殊字符
        query = re.sub(r'[^\w\s\u4e00-\u9fff]', '', query)

        return query.strip()

    @staticmethod
    def validate_agent_message(message: Dict[str, Any]) -> bool:
        """验证Agent消息"""
        required_fields = ['role', 'content']

        for field in required_fields:
            if field not in message:
                return False

        if message['role'] not in ['user', 'assistant', 'system', 'tool']:
            return False

        if not isinstance(message['content'], str):
            return False

        return True
