from typing import Optional
import asyncio
from playwright.async_api import async_playwright
from PIL import Image
import io
import base64
import logging

logger = logging.getLogger(__name__)


class ThumbnailGenerator:
    """缩略图生成器"""

    @staticmethod
    async def generate_from_html(
        html_content: str,
        width: int = 320,
        height: int = 180,
        scale: float = 1.0
    ) -> Optional[str]:
        """
        从HTML内容生成缩略图

        Args:
            html_content: HTML内容
            width: 缩略图宽度
            height: 缩略图高度
            scale: 缩放比例

        Returns:
            base64编码的缩略图数据，如果失败返回None
        """
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch()
                page = await browser.new_page()

                # 设置视口大小
                await page.set_viewport_size({
                    "width": int(width / scale),
                    "height": int(height / scale)
                })

                # 设置HTML内容
                await page.set_content(html_content)

                # 等待内容加载
                await page.wait_for_load_state('networkidle')

                # 截图
                screenshot = await page.screenshot(
                    full_page=False,
                    clip={
                        "x": 0,
                        "y": 0,
                        "width": int(width / scale),
                        "height": int(height / scale)
                    }
                )

                await browser.close()

                # 处理图片
                image = Image.open(io.BytesIO(screenshot))

                # 调整大小
                image = image.resize((width, height), Image.Resampling.LANCZOS)

                # 转换为base64
                buffer = io.BytesIO()
                image.save(buffer, format='PNG')
                image_base64 = base64.b64encode(buffer.getvalue()).decode()

                return f"data:image/png;base64,{image_base64}"

        except Exception as e:
            logger.error(f"Thumbnail generation error: {e}", exc_info=True)
            return None

    @staticmethod
    def generate_placeholder(
        text: str,
        width: int = 320,
        height: int = 180,
        bg_color: str = "#f3f4f6",
        text_color: str = "#6b7280"
    ) -> str:
        """
        生成占位符缩略图

        Args:
            text: 显示的文本
            width: 宽度
            height: 高度
            bg_color: 背景色
            text_color: 文字颜色

        Returns:
            base64编码的占位符图片
        """
        try:
            # 创建图片
            image = Image.new('RGB', (width, height), bg_color)
            from PIL import ImageDraw, ImageFont

            draw = ImageDraw.Draw(image)

            # 尝试使用默认字体
            try:
                font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24)
            except:
                font = ImageFont.load_default()

            # 计算文字位置
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]

            x = (width - text_width) // 2
            y = (height - text_height) // 2

            # 绘制文字
            draw.text((x, y), text, fill=text_color, font=font)

            # 转换为base64
            buffer = io.BytesIO()
            image.save(buffer, format='PNG')
            image_base64 = base64.b64encode(buffer.getvalue()).decode()

            return f"data:image/png;base64,{image_base64}"

        except Exception as e:
            logger.error(f"Placeholder generation error: {e}", exc_info=True)
            # 返回一个最小的透明图片作为fallback
            return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jzyr5AAAAABJRU5ErkJggg=="
