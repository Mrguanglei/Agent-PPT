# 工具可视化系统 - Manus 风格沙盒

## 🎯 功能概述

类似 **Manus** 的工具调用可视化系统，让 Agent 的思考过程完全透明。

## 工作流程

```
┌─────────────────────────────────────────────────────────────────┐
│                        聊天主界面                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  用户: 帮我做一个AI发展的PPT                                      │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ AI: 好的，让我来规划一下这个PPT...                          │  │
│  │                                                          │  │
│  │ [思考规划] 📝 [图片搜索] 🖼️ [初始化幻灯片] 📄              │  │  │ ← 工具按钮
│  │                                                          │  │
│  └───────────────────────────────────────────────────────────┘  │
│           ↓ 点击任意工具按钮                                     │
│                                                                 │
├═══════════════════════════╡═════════════════════════════════════│
│                            ↓                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 右侧沙盒面板 (400px)                      │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  🔍 图片搜索                              [×] 关闭        │   │
│  │  ───────────────────────────────────────────────────────  │   │
│  │  状态: ⏳ 执行中                                          │   │
│  │  执行时间: 2.34s                                         │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ 参数                                              │  │   │
│  │  │ {                                                │  │   │
│  │  │   "query": "AI technology development",          │  │   │
│  │  │   "num_results": 10                               │  │   │
│  │  │ }                                                │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ 结果                                              │  │   │
│  │  │  ┌─────┐ ┌─────┐ ┌─────┐                          │  │   │
│  │  │  │ 图1 │ │ 图2 │ │ 图3 │ ...                      │  │   │
│  │  │  └─────┘ └─────┘ └─────┘                          │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 核心组件

### 1. ToolCallButton - 工具按钮

**位置**: `frontend/src/components/tool-panel/ToolCallButton.tsx`

```tsx
<ToolCallButton
  index={0}
  name="search_images"
  status="running"
  onClick={() => selectTool(0)}  // 点击展开右侧面板
/>
```

**样式状态**:
- ⏳ `pending` - 等待中（灰色）
- 🔄 `running` - 执行中（蓝色+动画）
- ✅ `success` - 成功（绿色）
- ❌ `failed` - 失败（红色）

### 2. ToolSidePanel - 右侧沙盒

**位置**: `frontend/src/components/tool-panel/ToolSidePanel.tsx`

**功能**:
- ✅ 实时显示工具执行状态
- ✅ 显示工具参数
- ✅ 显示执行结果
- ✅ 支持多个工具切换（标签栏）
- ✅ 自动打开第一个工具

### 3. toolPanelStore - 状态管理

**位置**: `frontend/src/stores/toolPanelStore.ts`

```typescript
interface ToolPanelState {
  isOpen: boolean;           // 面板是否打开
  selectedIndex: number;     // 当前选中的工具索引
  toolCalls: ToolCall[];     // 所有工具调用记录

  openPanel(index);          // 打开面板
  closePanel();              // 关闭面板
  selectTool(index);         // 选择工具
  addToolCall(tool);         // 添加工具
  updateToolCall(index);    // 更新工具状态
}
```

## 工具标签对照表

| 工具名称 | 中文标签 | 图标 |
|---------|---------|------|
| `think` | 思考规划 | 📝 FileText |
| `initialize_slide` | 初始化幻灯片 | 📄 FileText |
| `insert_slides` | 插入页面 | 📄 FileText |
| `html` | 生成HTML | 📄 FileText |
| `update_slide` | 更新页面 | 📄 FileText |
| `web_search` | 网页搜索 | 🔍 Search |
| `search_images` | 图片搜索 | 🖼️ Image |
| `visit_page` | 访问页面 | 🌐 Globe |

## 交互流程详解

### 场景1: Agent 调用搜索图片

```
1. Agent 调用 search_images 工具
   ↓
2. 后端推送 tool_call_start 事件
   ↓
3. 前端显示 [图片搜索] 按钮（蓝色动画）
   ↓
4. 右侧自动弹出面板（因为是第一个工具）
   ↓
5. 面板实时显示：
   - 状态: 执行中...
   - 参数: { query: "AI development" }
   ↓
6. 后端推送 tool_call_complete 事件
   ↓
7. 前端更新：
   - 按钮变为绿色 ✅
   - 面板显示搜索结果（图片网格）
```

### 场景2: 点击历史工具

```
1. 用户点击消息中的 [初始化幻灯片] 按钮
   ↓
2. 右侧弹出该工具的详细信息
   ↓
3. 显示工具参数和结果
   ↓
4. 可以切换查看多个工具（使用标签栏）
```

## 动画效果

```tsx
// 按钮出现动画
initial={{ opacity: 0, scale: 0.9 }}
animate={{ opacity: 1, scale: 1 }}

// 悬停效果
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.98 }}

// 面板滑入动画
initial={{ width: 0, opacity: 0 }}
animate={{ width: 400, opacity: 1 }}
exit={{ width: 0, opacity: 0 }}
```

## 完整示例

```tsx
// ChatContainer 中处理工具调用
useAgentStream({
  agentRunId,
  onToolCallStart: (index, name) => {
    // 1. 添加工具到当前消息
    setCurrentToolCalls(prev => [...prev, { index, name, status: 'running' }]);

    // 2. 自动打开第一个工具的面板
    if (index === 0) {
      openPanel(0);
    }
  },
  onToolCallComplete: (index, name, status, result) => {
    // 3. 更新工具状态
    setCurrentToolCalls(prev =>
      prev.map(tc => tc.index === index ? { ...tc, status, result } : tc)
    );
  },
});

// MessageItem 中显示工具按钮
{message.tool_calls.map(toolCall => (
  <ToolCallButton
    index={toolCall.index}
    name={toolCall.name}
    status={toolCall.status}
    onClick={() => selectTool(toolCall.index)}  // 点击展开面板
  />
))}
```

## 效果预览

### 聊天界面

```
┌──────────────────────┬─────────────────────────────────┬──────────────┐
│                      │                                   │              │
│  历史对话              │         主聊天区域                 │  沙盒面板    │
│                      │                                   │              │
│  ├─ AI发展PPT         │  用户: 做一个AI发展PPT               │  🖼️ 图片搜索  │
│  └─ 产品介绍          │                                   │  ────────────  │
│                      │  AI: 好的，让我先搜索资料...         │  状态: ✅ 成功  │
│                      │                                   │  参数:        │
│                      │  [思考规划] 📝 [图片搜索] 🖼️       │  query: "..." │
│                      │                                   │  结果:        │
│                      │                                   │  [图1][图2]   │
│                      │                                   │              │
└──────────────────────┴─────────────────────────────────┴──────────────┘
```

这个系统已经完全实现，就像 Manus 一样！🎉
