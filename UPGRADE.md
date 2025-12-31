# PPT Agent - 升级文档

## 升级内容概述

本次升级将原有的 PPT Agent 系统升级为完整的 **AI Slides** 生成系统，基于您提供的系统提示词、Think模板和设计规范。

## 主要变化

### 1. 系统提示词升级

**文件**: `backend/app/agent/prompts.py`

- ✅ 完整的 AI Slides 系统提示词（包含角色定义、工具指南、设计规范）
- ✅ 18组配色方案
- ✅ 3种字体方案（商务/复古精致/活力未来）
- ✅ HTML/CSS 瑞士风格设计规范
- ✅ Think 模板（内部规划模板）

### 2. 工具系统重构

**新增工具**:
| 工具名 | 功能 | 原工具 |
|--------|------|--------|
| `think` | 内部思考和规划 | 无 |
| `initialize_slide` | 初始化幻灯片框架 | `initialize_design` |
| `insert_slides` | 插入幻灯片 | `insert_page` |
| `html` | 生成HTML内容 | 无 |
| `update_slide` | 更新幻灯片 | `update_page` |

**保留工具**:
- `web_search` - 网页搜索
- `search_images` - 图片搜索
- `visit_page` - 访问页面

### 3. 配色和字体配置

**文件**: `backend/app/agent/config.py`

- ✅ 18组预设配色方案
- ✅ 3种字体方案配置
- ✅ 布局类型定义
- ✅ 辅助函数用于获取配置

### 4. 数据库模型更新

**文件**: `backend/app/models/slide.py`

- ✅ 添加 `title` 字段
- ✅ `raw_content` 存储完整元数据（task_brief, layout, file_prefix等）
- ✅ `html_content` 存储完整HTML代码

### 5. 前端渲染更新

**新增组件**:
- `SlideCarousel` - 幻灯片轮播预览
- `SlidePreview` - 幻灯片预览弹窗
- 支持 1280x720 HTML 渲染

## 使用方式

### 标准工作流程

```
用户请求
    ↓
[think] - 使用Think模板规划
    ↓
[web_search] - 搜索资料（可选）
    ↓
[search_images] - 搜索图片（可选）
    ↓
[initialize_slide] - 初始化PPT框架
    ↓
循环：
    [insert_slides] → [html] × N
    ↓
完成
```

### Think 模板使用示例

Agent 会自动使用 Think 模板进行规划：

```
# PPT制作规划

## 一、需求分析
- 用户需求：制作关于AI发展的PPT
- 核心主题：人工智能技术演进
- 情感基调：专业现代

## 二、视觉风格设计
- 配色方案：冷色现代
- 字体方案：商务风格

## 三、页面结构规划
- 封面页：1页
- 正文内容页：5页
- 结束页：1页

...
```

### 配色方案选择

在 `initialize_slide` 时指定：

```python
{
    "color_scheme": "cool_modern",  # 冷色现代
    "font_scheme": "business"        # 商务风格
}
```

### 布局类型选择

在 `insert_slides` 时指定：

```python
{
    "layout": "Minimalist-Typography-Center-Focus"  # 封面页
}
```

## API 调用示例

### 初始化幻灯片

```bash
POST /api/v1/agent/run
{
  "message": "帮我制作一个关于人工智能发展的PPT"
}
```

Agent 会自动：
1. 使用 think 工具进行规划
2. 调用 initialize_slide 初始化
3. 循环调用 insert_slides + html 生成页面

## 注意事项

1. **图片搜索限制**: 只能在 `initialize_slide` 之前搜索图片
2. **HTML规范**: 生成的HTML必须遵循 1280x720 尺寸
3. **配色一致性**: 一旦选择配色方案，所有页面必须使用相同配色
4. **Think工具**: 用于内部规划，对用户不可见

## 文件结构变化

```
backend/app/agent/
├── prompts.py          # ✨ 已更新 - 完整模板系统
├── config.py           # ✨ 新增 - 配色字体配置
├── runner.py           # ✅ 兼容 - 无需修改
└── tools/
    ├── registry.py     # ✨ 已更新 - 新工具定义
    ├── think.py        # ✨ 新增
    ├── slides_operations.py  # ✨ 新增
    ├── web_search.py   # ✅ 保留
    ├── search_images.py # ✅ 保留
    └── visit_page.py   # ✅ 保留
```

## 下一步

1. 测试新的 Agent 工作流
2. 验证 HTML 渲染效果
3. 添加更多布局模板
4. 实现导出功能（PDF/PPTX）
