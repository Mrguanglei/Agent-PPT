from typing import Dict, Any
import re
from bs4 import BeautifulSoup


class HTMLProcessor:
    """HTML 处理工具"""

    @staticmethod
    def clean_html(html: str) -> str:
        """清理HTML内容"""
        if not html:
            return ""

        # 移除多余的空白字符
        html = re.sub(r'\s+', ' ', html.strip())

        # 移除空标签
        soup = BeautifulSoup(html, 'html.parser')

        # 移除空的p, div, span等标签
        for tag in soup.find_all(['p', 'div', 'span']):
            if not tag.get_text().strip() and not tag.find_all():
                tag.decompose()

        return str(soup)

    @staticmethod
    def extract_text_from_html(html: str) -> str:
        """从HTML中提取纯文本"""
        if not html:
            return ""

        soup = BeautifulSoup(html, 'html.parser')
        return soup.get_text(separator=' ', strip=True)

    @staticmethod
    def validate_html_structure(html: str) -> bool:
        """验证HTML结构是否有效"""
        try:
            soup = BeautifulSoup(html, 'html.parser')
            # 检查是否有基本的HTML结构
            return bool(soup.find())
        except:
            return False

    @staticmethod
    def generate_slide_html(
        title: str = "",
        content: list = None,
        image_url: str = None,
        style_config: Dict[str, Any] = None,
        is_cover: bool = False
    ) -> str:
        """生成幻灯片HTML - 瑞士风格设计"""
        content = content or []

        # 默认样式配置 (基于新模板)
        default_style = {
            "background": "#FEFEFE",
            "primary": "#44B54B",
            "accent": "#1399FF",
            "font_family": "'MiSans', sans-serif",
            "font_family_title": "'MiSans', sans-serif"
        }

        style = {**default_style, **(style_config or {})}

        # 基础HTML结构 - 瑞士风格
        html_parts = [
            '<!DOCTYPE html>',
            '<html lang="zh-CN">',
            '<head>',
            '<meta charset="UTF-8">',
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
            '<link href="https://cdn.cn.font.mi.com/font/css?family=MiSans:300,400,500,600,700:Chinese_Simplify,Latin&display=swap" rel="stylesheet">',
            '<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">',
            '<style>',
            f'* {{ margin: 0; padding: 0; box-sizing: border-box; }}',
            f'body {{ font-family: {style["font_family"]}; background: {style["background"]}; }}',
            f'.slide {{ width: 1280px; min-height: 720px; position: relative; overflow: hidden; }}',
            f'h1 {{ color: {style["primary"]}; font-size: 50px; font-weight: 600; margin-bottom: 20px; }}',
            f'h2 {{ color: {style["primary"]}; font-size: 40px; font-weight: 500; margin-bottom: 15px; }}',
            f'p {{ color: {style["primary"]}; font-size: 24px; line-height: 1.6; margin-bottom: 12px; }}',
            f'.accent {{ color: {style["accent"]}; }}',
            f'.content-block {{ margin-bottom: 30px; }}',
            f'.flex {{ display: flex; }}',
            f'.flex-col {{ flex-direction: column; }}',
            f'.justify-center {{ justify-content: center; }}',
            f'.items-center {{ align-items: center; }}',
            f'.text-center {{ text-align: center; }}',
            f'.text-left {{ text-align: left; }}',
            f'.material-icons {{ color: {style["primary"]}; font-size: 28px; margin-right: 8px; }}',
            '</style>',
            '</head>',
            '<body>',
            '<div class="slide">'
        ]

        if is_cover:
            # 封面页布局
            html_parts.extend([
                '<div class="flex flex-col justify-center items-center" style="height: 100vh; padding: 70px;">',
                '<div style="max-width: 70%; text-align: center;">'
            ])

            # 标题
            if title:
                html_parts.extend([
                    '<h1 style="font-size: 60px; margin-bottom: 20px;">',
                    title,
                    '</h1>'
                ])

            # 副标题
            if content and len(content) > 0:
                html_parts.extend([
                    '<p style="font-size: 20px; color: #666;">',
                    str(content[0]),
                    '</p>'
                ])

            html_parts.extend(['</div>', '</div>'])
        else:
            # 内容页布局 - 瑞士风格
            html_parts.extend([
                '<div class="flex flex-col" style="height: 100%; padding: 85px 70px 70px 70px;">',
                '<div style="flex: 1;">'
            ])

            # 标题区域 (85px高)
            if title:
                html_parts.extend([
                    '<div style="height: 85px; display: flex; align-items: flex-end; margin-bottom: 40px;">',
                    '<h2>',
                    title,
                    '</h2>',
                    '</div>'
                ])

            # 内容区域
            if content:
                html_parts.append('<div class="content-block">')
                for item in content:
                    if isinstance(item, dict) and item.get('type') == 'bullet':
                        html_parts.extend([
                            '<div class="flex items-center" style="margin-bottom: 15px;">',
                            '<i class="material-icons">check_circle</i>',
                            '<p>',
                            str(item.get('text', '')),
                            '</p>',
                            '</div>'
                        ])
                    else:
                        html_parts.extend([
                            '<p style="margin-bottom: 12px;">',
                            str(item),
                            '</p>'
                        ])
                html_parts.append('</div>')

            # 图片区域
            if image_url:
                html_parts.extend([
                    '<div style="position: absolute; bottom: 70px; right: 70px; width: 300px;">',
                    f'<img src="{image_url}" alt="slide image" ',
                    f'style="width: 100%; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />',
                    '</div>'
                ])

            html_parts.extend(['</div>', '</div>'])

        html_parts.extend(['</div>', '</body>', '</html>'])

        return ''.join(html_parts)

    @staticmethod
    def sanitize_html(html: str) -> str:
        """清理不安全的HTML内容"""
        if not html:
            return ""

        # 只允许安全的标签和属性
        allowed_tags = {
            'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'br',
            'img', 'a'
        }

        allowed_attrs = {
            'style': True,
            'src': True,
            'alt': True,
            'href': True,
            'target': True
        }

        soup = BeautifulSoup(html, 'html.parser')

        # 移除不允许的标签
        for tag in soup.find_all():
            if tag.name not in allowed_tags:
                tag.unwrap()
            else:
                # 移除不允许的属性
                attrs_to_remove = []
                for attr in tag.attrs:
                    if attr not in allowed_attrs:
                        attrs_to_remove.append(attr)
                for attr in attrs_to_remove:
                    del tag[attr]

        return str(soup)
