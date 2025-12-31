"""
AI Slides Configuration - Color Schemes and Font Schemes
"""

# ============================================================================
# 配色方案配置（18组）
# ============================================================================

COLOR_SCHEMES = {
    "warm_modern": {
        "name": "暖色现代",
        "background": "#F4F1E9",
        "primary": "#15857A",
        "accent": "#FF6A3B",
    },
    "warm_modern_dark": {
        "name": "暖色现代-深色",
        "background": "#111111",
        "primary": "#15857A",
        "accent": "#FF6A3B",
    },
    "warm_modern_purple": {
        "name": "暖色现代-紫红",
        "background": "#111111",
        "primary": "#7C3D5E",
        "accent": "#FF7E5E",
    },
    "cool_modern": {
        "name": "冷色现代",
        "background": "#FEFEFE",
        "primary": "#44B54B",
        "accent": "#1399FF",
    },
    "cool_modern_blue": {
        "name": "冷色现代-深蓝",
        "background": "#09325E",
        "primary": "#FFFFFF",
        "accent": "#7DE545",
    },
    "cool_modern_orange": {
        "name": "冷色现代-橙",
        "background": "#FEFEFE",
        "primary": "#1284BA",
        "accent": "#FF862F",
    },
    "cool_modern_teal": {
        "name": "冷色现代-蓝绿",
        "background": "#FEFEFE",
        "primary": "#133EFF",
        "accent": "#00CD82",
    },
    "dark_mineral": {
        "name": "深色矿物",
        "background": "#162235",
        "primary": "#FFFFFF",
        "accent": "#37DCF2",
    },
    "dark_mineral_green": {
        "name": "深色矿物-绿",
        "background": "#193328",
        "primary": "#FFFFFF",
        "accent": "#E7E950",
    },
    "soft_neutral": {
        "name": "柔和中性",
        "background": "#F7F3E6",
        "primary": "#E7F177",
        "accent": "#106188",
    },
    "soft_neutral_purple": {
        "name": "柔和中性-紫",
        "background": "#EBDCEF",
        "primary": "#73593C",
        "accent": "#B13DC6",
    },
    "soft_neutral_yellow": {
        "name": "柔和中性-黄绿",
        "background": "#8B9558",
        "primary": "#262626",
        "accent": "#E1DE2D",
    },
    "minimalist_beige": {
        "name": "极简主义",
        "background": "#F3F1ED",
        "primary": "#000000",
        "accent": "#D6C096",
    },
    "minimalist_white": {
        "name": "极简主义-白",
        "background": "#FFFFFF",
        "primary": "#000000",
        "accent": "#A6C40D",
    },
    "minimalist_gray": {
        "name": "极简主义-灰",
        "background": "#F3F1ED",
        "primary": "#393939",
        "accent": "#FFFFFF",
    },
    "warm_retro": {
        "name": "暖色复古",
        "background": "#F4EEEA",
        "primary": "#882F1C",
        "accent": "#FEE79B",
    },
    "warm_retro_green": {
        "name": "暖色复古-绿",
        "background": "#F4F1E9",
        "primary": "#2A4A3A",
        "accent": "#C89F62",
    },
    "warm_retro_brown": {
        "name": "暖色复古-棕",
        "background": "#554737",
        "primary": "#FFFFFF",
        "accent": "#66D4FF",
    },
}


# ============================================================================
# 字体方案配置
# ============================================================================

FONT_SCHEMES = {
    "business": {
        "name": "商务风格",
        "chinese": {
            "title": "MiSans",
            "body": "MiSans",
        },
        "english": {
            "title": "Source Code Pro",
            "body": "Roboto Flex",
        },
        "urls": [
            '<link href="https://cdn.cn.font.mi.com/font/css?family=MiSans:300,400,500,600,700:Chinese_Simplify,Latin&display=swap" rel="stylesheet">',
            '<link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;600;700&family=Roboto+Flex:wght@300;400;500;600&display=swap" rel="stylesheet">',
        ],
    },
    "retro_elegant": {
        "name": "复古精致",
        "chinese": {
            "title": "Source Han Serif SC",
            "body": "MiSans",
            "numbers": "Spectral",
        },
        "english": {
            "title": "Spectral",
            "body": "Quattrocento Sans",
        },
        "urls": [
            '<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&display=swap" rel="stylesheet">',
            '<link href="https://fonts.googleapis.com/css2?family=Spectral:wght@400;600;700&family=Quattrocento+Sans:wght@400;700&display=swap" rel="stylesheet">',
        ],
    },
    "vibrant_future": {
        "name": "活力未来",
        "chinese": {
            "title": "DouyinSans",
            "body": "MiSans",
        },
        "english": {
            "title": "BioRhyme",
            "body": "Archivo",
        },
        "urls": [
            '<link href="https://fonts.cdnfonts.com/css/biorhyme" rel="stylesheet">',
            '<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;500;600;700&display=swap" rel="stylesheet">',
        ],
    },
}


# ============================================================================
# 布局类型配置
# ============================================================================

LAYOUT_TYPES = {
    # 封面页布局
    "Minimalist-Typography-Center-Focus": {
        "category": "cover",
        "name": "简约居中",
        "description": "标题和副标题居中对齐，实现垂直居中",
    },
    "Cinematic-Image-Overlay-Typography": {
        "category": "cover",
        "name": "电影式图片叠加",
        "description": "使用全屏背景图，文字叠加在上方",
    },
    "Typography-Driven-With-Visual-Accent": {
        "category": "cover",
        "name": "文字主导+视觉点缀",
        "description": "以文字为主，辅以少量视觉元素",
    },

    # 内容页布局
    "Vertical-Flow-Text-Top": {
        "category": "content",
        "name": "垂直流动-文字在上",
        "description": "标题在顶部，内容垂直流动排列",
    },
    "Split-Tone-Image-Left-Text-Right": {
        "category": "content",
        "name": "分色调-图左文右",
        "description": "左侧图片，右侧文字，使用对比色",
    },
    "Editorial-Center-Hero-Column": {
        "category": "content",
        "name": "编辑式中心栏",
        "description": "内容居中，两侧留白",
    },
    "Headline-With-Twin-Editorial-Columns": {
        "category": "content",
        "name": "标题+双栏编辑",
        "description": "顶部标题，下方分为两栏内容",
    },
    "Content-Flow-With-Right-Rail-Anchor": {
        "category": "content",
        "name": "内容流+右侧锚点",
        "description": "主要内容在左，右侧有固定信息块",
    },
    "Canvas-Integrated-Multi-Charts": {
        "category": "content",
        "name": "画布集成多图表",
        "description": "多个图表集成在一个画布中",
    },

    # 章节页布局
    "Zen-Negative-Space-Focus": {
        "category": "section",
        "name": "禅意留白聚焦",
        "description": "大量留白，突出核心文字",
    },

    # 图表页布局
    "Floating-Key-Figures-On-Canvas": {
        "category": "chart",
        "name": "浮动关键数据",
        "description": "关键数据以浮动卡片形式展示",
    },
    "Data-Art-Hero-Chart-Focus": {
        "category": "chart",
        "name": "数据艺术-图表聚焦",
        "description": "以图表为主，数据可视化艺术化",
    },
}


def get_color_scheme(scheme_name: str):
    """获取配色方案"""
    return COLOR_SCHEMES.get(scheme_name, COLOR_SCHEMES["minimalist_white"])


def get_font_scheme(scheme_name: str):
    """获取字体方案"""
    return FONT_SCHEMES.get(scheme_name, FONT_SCHEMES["business"])


def get_layout_type(layout_name: str):
    """获取布局类型"""
    return LAYOUT_TYPES.get(layout_name, LAYOUT_TYPES["Vertical-Flow-Text-Top"])
