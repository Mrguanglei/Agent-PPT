"""
Tool Registry - Central registry for all Agent tools (Updated for AI Slides)
"""
from typing import Callable, Any, Dict
from app.agent.tools.think import think
from app.agent.tools.web_search import web_search
from app.agent.tools.search_images import search_images
from app.agent.tools.visit_page import visit_page
from app.agent.tools.slides_operations import (
    initialize_slide,
    insert_slides,
    html,
    update_slide,
)

# Tool registry mapping tool names to functions
TOOLS_REGISTRY: Dict[str, Callable] = {
    "think": think,
    "web_search": web_search,
    "search_images": search_images,
    "visit_page": visit_page,
    "initialize_slide": initialize_slide,
    "insert_slides": insert_slides,
    "html": html,
    "update_slide": update_slide,
}

# OpenAI Function Calling definitions
TOOLS_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "think",
            "description": "进行内部思考和规划，系统化地分析需求并制定PPT制作方案。使用Think模板组织思考过程。",
            "parameters": {
                "type": "object",
                "properties": {
                    "thought": {
                        "type": "string",
                        "description": "详细的思考内容，包含需求分析、视觉风格设计、页面结构规划、素材需求、技术实现要点和工具调用序列",
                    }
                },
                "required": ["thought"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "web_search",
            "description": "搜索网页信息，获取相关主题的资料、数据、案例等。返回相关结果与标题、URL和摘要。",
            "parameters": {
                "type": "object",
                "properties": {
                    "queries": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "搜索查询字符串数组（推荐1-3个）",
                        "minItems": 1,
                        "maxItems": 3,
                    }
                },
                "required": ["queries"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_images",
            "description": "搜索图片素材。注意：只能在初始化幻灯片设计之前搜索图片。返回图片URL与缩略图和元数据。",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "图片搜索查询，描述您要找的内容",
                    },
                    "num_results": {
                        "type": "integer",
                        "description": "返回结果数量（默认10，最多50）",
                        "default": 10,
                        "minimum": 1,
                        "maximum": 50,
                    }
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "visit_page",
            "description": "访问特定网页以提取完整内容。在web_search返回有希望的结果后使用。",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "要访问和提取内容的完整URL",
                    }
                },
                "required": ["url"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "initialize_slide",
            "description": "初始化幻灯片设计，创建PPT框架。在开始创建幻灯片前调用一次。",
            "parameters": {
                "type": "object",
                "properties": {
                    "description": {
                        "type": "string",
                        "description": "内容概要和设计风格描述",
                    },
                    "slide_name": {
                        "type": "string",
                        "description": "PPT文件名",
                    },
                    "title": {
                        "type": "string",
                        "description": "PPT主标题",
                    },
                    "slide_num": {
                        "type": "integer",
                        "description": "预计总页数",
                        "minimum": 1,
                    },
                    "width": {
                        "type": "integer",
                        "description": "幻灯片宽度（固定1280）",
                        "default": 1280,
                    },
                    "height": {
                        "type": "integer",
                        "description": "幻灯片高度（固定720）",
                        "default": 720,
                    },
                    "color_scheme": {
                        "type": "string",
                        "enum": [
                            "warm_modern", "warm_modern_dark", "warm_modern_purple",
                            "cool_modern", "cool_modern_blue", "cool_modern_orange", "cool_modern_teal",
                            "dark_mineral", "dark_mineral_green",
                            "soft_neutral", "soft_neutral_purple", "soft_neutral_yellow",
                            "minimalist_beige", "minimalist_white", "minimalist_gray",
                            "warm_retro", "warm_retro_green", "warm_retro_brown"
                        ],
                        "description": "配色方案",
                    },
                    "font_scheme": {
                        "type": "string",
                        "enum": ["business", "retro_elegant", "vibrant_future"],
                        "description": "字体方案（business商务/retro_elegant复古精致/vibrant_future活力未来）",
                    },
                },
                "required": ["description", "slide_name", "title", "slide_num"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "insert_slides",
            "description": "插入一页或多页幻灯片。为每页要创建的幻灯片调用一次。",
            "parameters": {
                "type": "object",
                "properties": {
                    "index": {
                        "type": "integer",
                        "description": "页面索引（从1开始）",
                        "minimum": 1,
                    },
                    "task_brief": {
                        "type": "string",
                        "description": "该页的简要任务描述",
                    },
                    "layout": {
                        "type": "string",
                        "description": "布局类型（如：Minimalist-Typography-Center-Focus, Vertical-Flow-Text-Top等）",
                    },
                    "file_prefix": {
                        "type": "string",
                        "description": "HTML文件名前缀",
                    },
                },
                "required": ["index", "task_brief", "layout", "file_prefix"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "html",
            "description": "生成单页幻灯片的HTML内容。为insert_slides调用的每一页调用此工具。",
            "parameters": {
                "type": "object",
                "properties": {
                    "index": {
                        "type": "integer",
                        "description": "页面索引",
                        "minimum": 1,
                    },
                    "file_prefix": {
                        "type": "string",
                        "description": "文件名前缀（应与insert_slides使用的前缀匹配）",
                    },
                    "html_code": {
                        "type": "string",
                        "description": "完整的HTML代码（遵循1280x720尺寸，瑞士风格设计，包含Material Icons链接）",
                    },
                },
                "required": ["index", "file_prefix", "html_code"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "update_slide",
            "description": "更新已存在的幻灯片内容。用于修改或改进之前创建的幻灯片。",
            "parameters": {
                "type": "object",
                "properties": {
                    "index": {
                        "type": "integer",
                        "description": "页面索引（从1开始）",
                        "minimum": 1,
                    },
                    "task_brief": {
                        "type": "string",
                        "description": "更新任务的简要描述",
                    },
                    "layout": {
                        "type": "string",
                        "description": "新的布局类型（可选）",
                    },
                    "file_prefix": {
                        "type": "string",
                        "description": "HTML文件名前缀",
                    },
                },
                "required": ["index", "task_brief"],
            },
        },
    },
]


def get_tool_function(tool_name: str) -> Callable:
    """Get a tool function by name"""
    if tool_name not in TOOLS_REGISTRY:
        raise ValueError(f"Unknown tool: {tool_name}")
    return TOOLS_REGISTRY[tool_name]


async def execute_tool(tool_name: str, **kwargs) -> Any:
    """Execute a tool with given parameters"""
    tool_func = get_tool_function(tool_name)
    return await tool_func(**kwargs)
