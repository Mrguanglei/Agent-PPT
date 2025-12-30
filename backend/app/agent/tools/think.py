from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


# PPT制作规划模板
PPT_PLANNING_TEMPLATE = """
🎯 PPT制作规划模板

# PPT制作规划

## 一、需求分析

### 核心主题
- 用户需求：{user_requirements}
- 核心主题：{core_theme}
- 情感基调：{emotional_tone}

### 内容范围
- 时间跨度：{time_span}
- 主要内容：{main_content}
- 关键节点：{key_points}

### 用户特殊要求
- 页数要求：{page_requirements}
- 风格要求：{style_requirements}
- 配色偏好：{color_preferences}
- 视觉元素：{visual_elements}

---

## 二、视觉风格设计

### 整体风格
- 设计风格：{design_style}
- 情感氛围：{emotional_atmosphere}
- 视觉语言：{visual_language}

### 配色方案选择
从预设配色组中选择：
- {"✅" if "warm_modern" in selected_color_scheme.lower() else "[ ]"} 暖色现代
- {"✅" if "cool_modern" in selected_color_scheme.lower() else "[ ]"} 冷色现代
- {"✅" if "dark_mineral" in selected_color_scheme.lower() else "[ ]"} 深色矿物
- {"✅" if "soft_neutral" in selected_color_scheme.lower() else "[ ]"} 柔和中性
- {"✅" if "minimalist" in selected_color_scheme.lower() else "[ ]"} 极简主义
- {"✅" if "warm_retro" in selected_color_scheme.lower() else "[ ]"} 暖色复古

最终选择：{selected_color_scheme}
- 背景色：{background_color}
- 主色：{primary_color}
- 强调色：{accent_color}

### 字体方案选择
根据风格选择：
- {"✅" if "business" in selected_font_scheme.lower() else "[ ]"} 商务风格（中文：MiSans；英文：Source Code Pro + Roboto Flex）
- {"✅" if "retro" in selected_font_scheme.lower() else "[ ]"} 复古精致（中文：Source Han Serif SC；英文：Spectral + Quattrocento Sans）
- {"✅" if "vibrant" in selected_font_scheme.lower() else "[ ]"} 活力未来（中文：抖音黑体 + MiSans；英文：BioRhyme + Archivo）

最终选择：{selected_font_scheme}

---

## 三、页面结构规划

### 总页数规划
- 封面页：{cover_pages}页
- 目录/引言页：{intro_pages}页
- 正文内容页：{content_pages}页
- 结束/展望页：{ending_pages}页
- 总计：{total_pages}页

### 每页详细规划

{pages_detail}

---

## 四、素材需求清单

### 图片素材
{images_list}

### 图表素材
{charts_list}

### 图标素材
{icons_list}

---

## 五、技术实现要点

### HTML/CSS规范
- 页面尺寸：1280px × 720px
- 最小高度：720px
- 主容器：使用flex布局
- 遵循瑞士平面设计原则

### 布局选择（每页）
{pages_layout}

### 组件使用
- {"✅" if use_material_icons else "[ ]"} Material Icons（链接：<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">）
- {"✅" if use_chart_js else "[ ]"} Chart.js（<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>）
- {"✅" if use_google_fonts else "[ ]"} Google Fonts
- {"✅" if use_tailwind else "[ ]"} Tailwind CSS

---

## 六、时间轴/历史类特殊处理

### 时间轴展示方式
- {"✅" if use_timeline_images else "[ ]"} 使用图片形式展示时间轴
- {"✅" if avoid_html_timeline else "[ ]"} 禁止使用HTML绘制时间线元素
- {"✅" if search_timeline_charts else "[ ]"} 搜索现成的时间轴图表图片

### 历史节点展示
- {"✅" if use_card_layout else "[ ]"} 使用卡片布局展示各个朝代/时期
- {"✅" if use_icons_for_history else "[ ]"} 使用图标辅助说明
- {"✅" if maintain_chronological_order else "[ ]"} 保持时间顺序和逻辑连贯

---

## 七、内容优化建议

### 文字精简原则
- 每页不超过100字
- 使用关键词而非长句
- 标题简洁有力
- 避免堆砌信息

### 视觉增强
- 使用大尺寸数字突出关键数据
- 使用图标增强可读性
- 使用图片增加视觉冲击
- 保持留白，避免拥挤

### 全局一致性
- 配色方案统一
- 字体方案统一
- 布局风格协调
- 过渡自然流畅

---

## 八、质量检查清单

### 内容完整性
- {"✅" if content_completeness else "[ ]"} 涵盖所有用户要求的历史阶段
- {"✅" if key_points_included else "[ ]"} 包含关键节点和重要事件
- {"✅" if content_accuracy else "[ ]"} 内容准确无误

### 视觉效果
- {"✅" if color_scheme_correct else "[ ]"} 配色符合用户要求
- {"✅" if fonts_readable else "[ ]"} 字体清晰易读
- {"✅" if layout_beautiful else "[ ]"} 布局美观大方
- {"✅" if images_quality_good else "[ ]"} 图片质量良好

### 技术规范
- {"✅" if page_size_correct else "[ ]"} 页面尺寸正确
- {"✅" if code_standard else "[ ]"} 代码规范完整
- {"✅" if no_extra_code else "[ ]"} 无多余或错误代码
- {"✅" if html_css_standard else "[ ]"} 符合HTML/CSS标准

### 用户体验
- {"✅" if information_clear else "[ ]"} 信息传达清晰
- {"✅" if visual_hierarchy else "[ ]"} 视觉层次分明
- {"✅" if browsing_smooth else "[ ]"} 浏览体验流畅
- {"✅" if overall_style_unified else "[ ]"} 整体风格统一
"""


# 布局类型参考
LAYOUT_TYPES = {
    "cover": [
        "Minimalist-Typography-Center-Focus（简约居中）",
        "Cinematic-Image-Overlay-Typography（电影式图片叠加）",
        "Typography-Driven-With-Visual-Accent（文字主导+视觉点缀）"
    ],
    "content": [
        "Vertical-Flow-Text-Top（垂直流动-文字在上）",
        "Split-Tone-Image-Left-Text-Right（分色调-图左文右）",
        "Editorial-Center-Hero-Column（编辑式中心栏）",
        "Headline-With-Twin-Editorial-Columns（标题+双栏编辑）",
        "Content-Flow-With-Right-Rail-Anchor（内容流+右侧锚点）",
        "Canvas-Integrated-Multi-Charts（画布集成多图表）"
    ],
    "chapter": [
        "Zen-Negative-Space-Focus（禅意留白聚焦）",
        "Typography-Driven-With-Visual-Accent（文字主导+视觉点缀）",
        "Minimalist-Typography-Center-Focus（简约居中）"
    ],
    "chart": [
        "Canvas-Integrated-Multi-Charts（画布集成多图表）",
        "Floating-Key-Figures-On-Canvas（浮动关键数据）",
        "Data-Art-Hero-Chart-Focus（数据艺术-图表聚焦）"
    ]
}


async def think(
    reasoning: str,
    current_state: str = None,
    next_actions: str = None,
    project_id: str = None,
    # PPT规划相关参数
    user_requirements: str = None,
    core_theme: str = None,
    emotional_tone: str = None,
    time_span: str = None,
    main_content: str = None,
    key_points: str = None,
    page_requirements: str = None,
    style_requirements: str = None,
    color_preferences: str = None,
    visual_elements: str = None,
    design_style: str = None,
    emotional_atmosphere: str = None,
    visual_language: str = None,
    selected_color_scheme: str = None,
    background_color: str = None,
    primary_color: str = None,
    accent_color: str = None,
    selected_font_scheme: str = None,
    cover_pages: int = None,
    intro_pages: int = None,
    content_pages: int = None,
    ending_pages: int = None,
    total_pages: int = None,
    pages_detail: str = None,
    images_list: str = None,
    charts_list: str = None,
    icons_list: str = None,
    pages_layout: str = None,
    use_material_icons: bool = None,
    use_chart_js: bool = None,
    use_google_fonts: bool = None,
    use_tailwind: bool = None,
    use_timeline_images: bool = None,
    avoid_html_timeline: bool = None,
    search_timeline_charts: bool = None,
    use_card_layout: bool = None,
    use_icons_for_history: bool = None,
    maintain_chronological_order: bool = None,
    content_completeness: bool = None,
    key_points_included: bool = None,
    content_accuracy: bool = None,
    color_scheme_correct: bool = None,
    fonts_readable: bool = None,
    layout_beautiful: bool = None,
    images_quality_good: bool = None,
    page_size_correct: bool = None,
    code_standard: bool = None,
    no_extra_code: bool = None,
    html_css_standard: bool = None,
    information_clear: bool = None,
    visual_hierarchy: bool = None,
    browsing_smooth: bool = None,
    overall_style_unified: bool = None
) -> Dict[str, Any]:
    """
    详细计划、决策过程或对当前状态以及下一步做什么的个人思考空间

    Args:
        reasoning: 详细的推理过程和思考内容
        current_state: 当前状态描述
        next_actions: 下一步行动计划
        project_id: 项目ID（用于日志记录）
        ... (PPT规划相关参数)

    Returns:
        思考结果
    """
    try:
        logger.info(f"Agent thinking: {reasoning}")

        # 如果提供了PPT规划参数，生成完整的规划模板
        if any([
            user_requirements, core_theme, design_style, selected_color_scheme,
            total_pages, pages_detail
        ]):
            planning_result = PPT_PLANNING_TEMPLATE.format(
                user_requirements=user_requirements or "待分析",
                core_theme=core_theme or "待确定",
                emotional_tone=emotional_tone or "专业",
                time_span=time_span or "无特定时间限制",
                main_content=main_content or "待分析",
                key_points=key_points or "待确定",
                page_requirements=page_requirements or "5-10页",
                style_requirements=style_requirements or "现代简约",
                color_preferences=color_preferences or "无特殊要求",
                visual_elements=visual_elements or "图片、图表",
                design_style=design_style or "现代",
                emotional_atmosphere=emotional_atmosphere or "专业",
                visual_language=visual_language or "简约大气",
                selected_color_scheme=selected_color_scheme or "冷色现代",
                background_color=background_color or "#FEFEFE",
                primary_color=primary_color or "#44B54B",
                accent_color=accent_color or "#1399FF",
                selected_font_scheme=selected_font_scheme or "商务风格",
                cover_pages=cover_pages or 1,
                intro_pages=intro_pages or 1,
                content_pages=content_pages or (total_pages - 3 if total_pages else 5),
                ending_pages=ending_pages or 1,
                total_pages=total_pages or 8,
                pages_detail=pages_detail or "待详细规划每一页",
                images_list=images_list or "- [ ] 封面图片：展示主题的代表性图像\n- [ ] 内容图片：辅助说明的插图",
                charts_list=charts_list or "- [ ] 数据图表：如需要展示数据时使用",
                icons_list=icons_list or "- [ ] Material Icons：check_circle, arrow_forward等",
                pages_layout=pages_layout or "根据内容类型选择相应布局",
                use_material_icons=use_material_icons if use_material_icons is not None else True,
                use_chart_js=use_chart_js if use_chart_js is not None else False,
                use_google_fonts=use_google_fonts if use_google_fonts is not None else True,
                use_tailwind=use_tailwind if use_tailwind is not None else False,
                use_timeline_images=use_timeline_images if use_timeline_images is not None else True,
                avoid_html_timeline=avoid_html_timeline if avoid_html_timeline is not None else True,
                search_timeline_charts=search_timeline_charts if search_timeline_charts is not None else True,
                use_card_layout=use_card_layout if use_card_layout is not None else True,
                use_icons_for_history=use_icons_for_history if use_icons_for_history is not None else True,
                maintain_chronological_order=maintain_chronological_order if maintain_chronological_order is not None else True,
                content_completeness=content_completeness if content_completeness is not None else False,
                key_points_included=key_points_included if key_points_included is not None else False,
                content_accuracy=content_accuracy if content_accuracy is not None else False,
                color_scheme_correct=color_scheme_correct if color_scheme_correct is not None else False,
                fonts_readable=fonts_readable if fonts_readable is not None else False,
                layout_beautiful=layout_beautiful if layout_beautiful is not None else False,
                images_quality_good=images_quality_good if images_quality_good is not None else False,
                page_size_correct=page_size_correct if page_size_correct is not None else False,
                code_standard=code_standard if code_standard is not None else False,
                no_extra_code=no_extra_code if no_extra_code is not None else False,
                html_css_standard=html_css_standard if html_css_standard is not None else False,
                information_clear=information_clear if information_clear is not None else False,
                visual_hierarchy=visual_hierarchy if visual_hierarchy is not None else False,
                browsing_smooth=browsing_smooth if browsing_smooth is not None else False,
                overall_style_unified=overall_style_unified if overall_style_unified is not None else False
            )

            result = {
                "success": True,
                "reasoning": reasoning,
                "current_state": current_state,
                "next_actions": next_actions,
                "ppt_planning": planning_result,
                "message": "PPT制作规划完成"
            }
        else:
            # 普通思考
            result = {
                "success": True,
                "reasoning": reasoning,
                "current_state": current_state,
                "next_actions": next_actions,
                "message": "思考完成，已规划下一步行动"
            }

        logger.info(f"Think result: {result}")
        return result

    except Exception as e:
        logger.error(f"Think error: {e}", exc_info=True)
        return {"success": False, "error": str(e)}


def generate_page_detail_template(page_num: int, page_type: str, title: str,
                                content: list = None, layout: str = None) -> str:
    """生成页面详细规划模板"""
    content_str = "\n".join([f"  * {item}" for item in (content or ["待定"])])
    layout_str = layout or "待选择"

    return f"""
#### 第{page_num}页：{title}
- 页面类型：{page_type}
- 标题：{title}
- 核心内容：
{content_str}
- 布局方式：{layout_str}
- 图表/图标：待定
"""


def get_layout_recommendation(page_type: str, content_type: str = None) -> str:
    """根据页面类型和内容类型推荐布局"""
    if page_type == "cover":
        return "Minimalist-Typography-Center-Focus（简约居中）"
    elif page_type == "content":
        if "image" in (content_type or "").lower():
            return "Split-Tone-Image-Left-Text-Right（分色调-图左文右）"
        elif "chart" in (content_type or "").lower():
            return "Canvas-Integrated-Multi-Charts（画布集成多图表）"
        else:
            return "Vertical-Flow-Text-Top（垂直流动-文字在上）"
    elif page_type == "chapter":
        return "Zen-Negative-Space-Focus（禅意留白聚焦）"
    else:
        return "Editorial-Center-Hero-Column（编辑式中心栏）"
