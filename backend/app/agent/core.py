from openai import AsyncOpenAI
from typing import AsyncGenerator, Dict, Any, List
import json
import logging
import time
from app.config import settings
from app.agent.tools import TOOLS_REGISTRY
from app.agent.prompts import SYSTEM_PROMPT
from app.services.agent_service import AgentService
from app.database import get_db
from app.schemas.agent import AgentLogBase

logger = logging.getLogger(__name__)


class PPTAgent:
    """PPT 生成 Agent 核心"""

    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL
        )
        self.model = settings.OPENAI_MODEL
        self.tools = self._register_tools()

    def _register_tools(self) -> List[Dict]:
        """注册所有工具"""
        return [
            {
                "type": "function",
                "function": {
                    "name": "search_images",
                    "description": "搜索图片，使用自然语言描述所需图片",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "图片描述（自然语言，例如：'一位穿着职业装的女性在现代办公室中使用笔记本电脑'）"
                            },
                            "gl": {
                                "type": "string",
                                "description": "国家代码（cn, us, jp等）",
                                "default": "cn"
                            },
                            "rank": {
                                "type": "boolean",
                                "description": "是否使用AI排序",
                                "default": True
                            }
                        },
                        "required": ["query"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "web_search",
                    "description": "搜索网页信息",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "queries": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "搜索查询列表"
                            },
                            "recency_days": {
                                "type": "number",
                                "description": "搜索最近几天的内容，-1表示全部时间",
                                "default": -1
                            }
                        },
                        "required": ["queries"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "visit_page",
                    "description": "访问网页获取详细内容",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "url": {
                                "type": "string",
                                "description": "要访问的网页URL"
                            }
                        },
                        "required": ["url"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "initialize_design",
                    "description": "初始化PPT设计",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string", "description": "PPT标题"},
                            "description": {"type": "string", "description": "PPT描述和设计风格"},
                            "slide_name": {"type": "string", "description": "PPT文件名"},
                            "slide_num": {"type": "number", "description": "总页数"},
                            "width": {"type": "number", "description": "宽度（通常1280）"},
                            "height": {"type": "number", "description": "高度（通常720）"}
                        },
                        "required": ["title", "description", "slide_name", "slide_num", "width", "height"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "insert_page",
                    "description": "插入新页面",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "index": {"type": "number", "description": "插入位置"},
                            "html": {"type": "string", "description": "页面HTML代码"},
                            "action_description": {"type": "string", "description": "操作描述"}
                        },
                        "required": ["index", "html", "action_description"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "update_page",
                    "description": "更新现有页面",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "index": {"type": "number", "description": "页面索引"},
                            "html": {"type": "string", "description": "更新后的HTML代码"},
                            "action_description": {"type": "string", "description": "操作描述"}
                        },
                        "required": ["index", "html", "action_description"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "remove_pages",
                    "description": "删除页面",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "indexes": {
                                "type": "array",
                                "items": {"type": "number"},
                                "description": "要删除的页面索引列表"
                            },
                            "action_description": {"type": "string", "description": "操作描述"}
                        },
                        "required": ["indexes", "action_description"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "think",
                    "description": "详细计划、决策过程或对当前状态以及下一步做什么的个人思考空间，支持PPT制作规划",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "reasoning": {
                                "type": "string",
                                "description": "详细的推理过程和思考内容"
                            },
                            "current_state": {
                                "type": "string",
                                "description": "当前状态描述"
                            },
                            "next_actions": {
                                "type": "string",
                                "description": "下一步行动计划"
                            },
                            # PPT规划相关参数
                            "user_requirements": {
                                "type": "string",
                                "description": "用户具体需求描述"
                            },
                            "core_theme": {
                                "type": "string",
                                "description": "提炼的核心主题"
                            },
                            "emotional_tone": {
                                "type": "string",
                                "description": "情感基调，如正式/活泼/专业等"
                            },
                            "time_span": {
                                "type": "string",
                                "description": "内容时间跨度"
                            },
                            "main_content": {
                                "type": "string",
                                "description": "主要涵盖的内容领域"
                            },
                            "key_points": {
                                "type": "string",
                                "description": "必须包含的关键信息点"
                            },
                            "page_requirements": {
                                "type": "string",
                                "description": "页数要求"
                            },
                            "style_requirements": {
                                "type": "string",
                                "description": "风格要求"
                            },
                            "color_preferences": {
                                "type": "string",
                                "description": "配色偏好"
                            },
                            "visual_elements": {
                                "type": "string",
                                "description": "视觉元素需求"
                            },
                            "design_style": {
                                "type": "string",
                                "description": "设计风格"
                            },
                            "emotional_atmosphere": {
                                "type": "string",
                                "description": "情感氛围"
                            },
                            "visual_language": {
                                "type": "string",
                                "description": "视觉语言"
                            },
                            "selected_color_scheme": {
                                "type": "string",
                                "description": "选择的配色方案名称"
                            },
                            "background_color": {
                                "type": "string",
                                "description": "背景色HEX值"
                            },
                            "primary_color": {
                                "type": "string",
                                "description": "主色HEX值"
                            },
                            "accent_color": {
                                "type": "string",
                                "description": "强调色HEX值"
                            },
                            "selected_font_scheme": {
                                "type": "string",
                                "description": "选择的字体方案名称"
                            },
                            "cover_pages": {
                                "type": "number",
                                "description": "封面页数量"
                            },
                            "intro_pages": {
                                "type": "number",
                                "description": "引言页数量"
                            },
                            "content_pages": {
                                "type": "number",
                                "description": "内容页数量"
                            },
                            "ending_pages": {
                                "type": "number",
                                "description": "结束页数量"
                            },
                            "total_pages": {
                                "type": "number",
                                "description": "总页数"
                            },
                            "pages_detail": {
                                "type": "string",
                                "description": "每页详细规划内容"
                            },
                            "images_list": {
                                "type": "string",
                                "description": "图片素材需求清单"
                            },
                            "charts_list": {
                                "type": "string",
                                "description": "图表素材需求清单"
                            },
                            "icons_list": {
                                "type": "string",
                                "description": "图标素材需求清单"
                            },
                            "pages_layout": {
                                "type": "string",
                                "description": "页面布局选择"
                            },
                            "use_material_icons": {
                                "type": "boolean",
                                "description": "是否使用Material Icons"
                            },
                            "use_chart_js": {
                                "type": "boolean",
                                "description": "是否使用Chart.js"
                            },
                            "use_google_fonts": {
                                "type": "boolean",
                                "description": "是否使用Google Fonts"
                            },
                            "use_tailwind": {
                                "type": "boolean",
                                "description": "是否使用Tailwind CSS"
                            },
                            "use_timeline_images": {
                                "type": "boolean",
                                "description": "是否使用图片形式展示时间轴"
                            },
                            "avoid_html_timeline": {
                                "type": "boolean",
                                "description": "是否禁止使用HTML绘制时间线"
                            },
                            "search_timeline_charts": {
                                "type": "boolean",
                                "description": "是否搜索现成的时间轴图表图片"
                            },
                            "use_card_layout": {
                                "type": "boolean",
                                "description": "是否使用卡片布局展示历史节点"
                            },
                            "use_icons_for_history": {
                                "type": "boolean",
                                "description": "是否使用图标辅助历史说明"
                            },
                            "maintain_chronological_order": {
                                "type": "boolean",
                                "description": "是否保持时间顺序和逻辑连贯"
                            },
                            "content_completeness": {
                                "type": "boolean",
                                "description": "内容完整性检查"
                            },
                            "key_points_included": {
                                "type": "boolean",
                                "description": "关键节点是否包含"
                            },
                            "content_accuracy": {
                                "type": "boolean",
                                "description": "内容准确性"
                            },
                            "color_scheme_correct": {
                                "type": "boolean",
                                "description": "配色方案是否正确"
                            },
                            "fonts_readable": {
                                "type": "boolean",
                                "description": "字体是否清晰易读"
                            },
                            "layout_beautiful": {
                                "type": "boolean",
                                "description": "布局是否美观大方"
                            },
                            "images_quality_good": {
                                "type": "boolean",
                                "description": "图片质量是否良好"
                            },
                            "page_size_correct": {
                                "type": "boolean",
                                "description": "页面尺寸是否正确"
                            },
                            "code_standard": {
                                "type": "boolean",
                                "description": "代码是否规范完整"
                            },
                            "no_extra_code": {
                                "type": "boolean",
                                "description": "是否无多余或错误代码"
                            },
                            "html_css_standard": {
                                "type": "boolean",
                                "description": "是否符合HTML/CSS标准"
                            },
                            "information_clear": {
                                "type": "boolean",
                                "description": "信息传达是否清晰"
                            },
                            "visual_hierarchy": {
                                "type": "boolean",
                                "description": "视觉层次是否分明"
                            },
                            "browsing_smooth": {
                                "type": "boolean",
                                "description": "浏览体验是否流畅"
                            },
                            "overall_style_unified": {
                                "type": "boolean",
                                "description": "整体风格是否统一"
                            }
                        },
                        "required": ["reasoning"]
                    }
                }
            }
        ]

    async def process_stream(
        self,
        project_id: str,
        user_message: str,
        conversation_history: List[Dict],
        conversation_id: str = None
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        流式处理用户请求

        Args:
            project_id: 项目ID
            user_message: 用户消息
            conversation_history: 对话历史
            conversation_id: 对话ID

        Yields:
            消息块字典
        """
        try:
            # 构建消息
            messages = [
                {"role": "system", "content": SYSTEM_PROMPT}
            ] + conversation_history + [
                {"role": "user", "content": user_message}
            ]

            # 调用 OpenAI API
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                tools=self.tools,
                tool_choice="auto",
                stream=True,
                temperature=0.7
            )

            current_tool_call = None
            collected_messages = []

            async for chunk in response:
                choice = chunk.choices[0]
                delta = choice.delta

                # 处理文本内容
                if delta.content:
                    collected_messages.append(delta.content)
                    yield {
                        "type": "message",
                        "data": {"content": delta.content}
                    }

                # 处理工具调用
                if delta.tool_calls:
                    for tool_call in delta.tool_calls:
                        if not current_tool_call:
                            current_tool_call = {
                                "id": tool_call.id,
                                "name": tool_call.function.name,
                                "arguments": ""
                            }

                            # think工具不显示给用户
                            if tool_call.function.name != "think":
                                yield {
                                    "type": "tool_call_start",
                                    "data": {"tool": tool_call.function.name}
                                }

                        if tool_call.function.arguments:
                            current_tool_call["arguments"] += tool_call.function.arguments

                # 工具调用完成
                if choice.finish_reason == "tool_calls" and current_tool_call:
                    # 执行工具
                    start_time = time.time()
                    tool_result = await self._execute_tool(
                        current_tool_call["name"],
                        json.loads(current_tool_call["arguments"]),
                        project_id
                    )
                    execution_time = time.time() - start_time

                    # think工具的结果不显示给用户，但需要在think后向用户说明下一步行动
                    if current_tool_call["name"] != "think":
                        yield {
                            "type": "tool_call_complete",
                            "data": {
                                "tool": current_tool_call["name"],
                                "result": tool_result
                            }
                        }
                    else:
                        # think工具完成后，向用户说明下一步行动
                        if "ppt_planning" in tool_result and tool_result["ppt_planning"]:
                            yield {
                                "type": "message",
                                "data": {
                                    "content": f"我已经完成了PPT制作规划。根据您的需求，我将创建一个{tool_result.get('total_pages', '多页')}的演示文稿，使用{tool_result.get('selected_color_scheme', '现代')}配色方案和{tool_result.get('selected_font_scheme', '专业')}字体风格。现在开始生成PPT内容..."
                                }
                            }

                    # 记录工具执行日志 (think工具也记录)
                    if conversation_id:
                        async with get_db() as db:
                            await AgentService.create_agent_log(
                                db,
                                conversation_id,
                                AgentLogBase(
                                    tool_name=current_tool_call["name"],
                                    tool_params=json.loads(current_tool_call["arguments"]),
                                    tool_result=tool_result,
                                    execution_time=execution_time,
                                    status="success" if tool_result.get("success", True) else "failed",
                                    error_message=str(tool_result.get("error")) if tool_result.get("error") else None
                                )
                            )

                    # 将工具结果添加到消息历史并继续对话
                    messages.append({
                        "role": "assistant",
                        "tool_calls": [{
                            "id": current_tool_call["id"],
                            "type": "function",
                            "function": {
                                "name": current_tool_call["name"],
                                "arguments": current_tool_call["arguments"]
                            }
                        }]
                    })
                    messages.append({
                        "role": "tool",
                        "tool_call_id": current_tool_call["id"],
                        "content": json.dumps(tool_result)
                    })

                    # 继续对话
                    current_tool_call = None
                    response = await self.client.chat.completions.create(
                        model=self.model,
                        messages=messages,
                        tools=self.tools,
                        tool_choice="auto",
                        stream=True
                    )

        except Exception as e:
            logger.error(f"Agent processing error: {e}", exc_info=True)
            yield {
                "type": "error",
                "data": {"message": str(e)}
            }

    async def _execute_tool(
        self,
        tool_name: str,
        arguments: Dict,
        project_id: str
    ) -> Any:
        """执行工具调用"""
        tool_func = TOOLS_REGISTRY.get(tool_name)
        if not tool_func:
            raise ValueError(f"Unknown tool: {tool_name}")

        logger.info(f"Executing tool: {tool_name} with args: {arguments}")
        result = await tool_func(project_id=project_id, **arguments)
        logger.info(f"Tool {tool_name} result: {result}")

        return result
