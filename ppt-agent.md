# PPT Agent 完整产品设计文档

**版本**: v2.0  
**更新日期**: 2025-01-01  
**文档类型**: 技术产品设计文档

---

## 📑 目录

1. [产品概述](#1-产品概述)
2. [系统架构设计](#2-系统架构设计)
3. [数据库设计](#3-数据库设计)
4. [后端技术方案](#4-后端技术方案)
5. [前端设计方案](#5-前端设计方案)
6. [界面设计与交互](#6-界面设计与交互)
7. [工具调用与侧边栏面板](#7-工具调用与侧边栏面板)
8. [Agent 工作流程](#8-agent-工作流程)
9. [API 接口文档](#9-api-接口文档)
10. [部署方案](#10-部署方案)
11. [开发计划](#11-开发计划)

---

## 1. 产品概述

### 1.1 产品定位

**PPT Agent** 是一款基于 OpenAI Function Calling 的智能幻灯片生成平台，通过自然语言对话，自动完成从内容搜索、素材收集到幻灯片设计的全流程。

### 1.2 核心价值

- **零设计门槛**: 用户无需任何设计能力，通过对话即可生成专业 PPT
- **智能化流程**: Agent 自动规划、搜索、设计，全程自动化
- **高度定制化**: 支持实时修改、风格调整、内容迭代
- **可视化工具调用**: 实时展示 Agent 工具调用过程，类似沙盒体验

### 1.3 核心功能

| 功能模块 | 描述 | 优先级 |
|---------|------|--------|
| 智能对话生成 | 用户通过对话描述需求，Agent 自动生成 PPT | P0 |
| 工具调用可视化 | 右侧面板实时展示工具调用详情 | P0 |
| 对话历史管理 | 左侧边栏展示历史对话记录 | P0 |
| 多源信息搜索 | 集成网页搜索、图片搜索、文档解析 | P0 |
| 实时预览 | 流式生成，支持逐页预览 | P0 |
| 在线编辑 | 支持修改文本、替换图片、调整布局 | P1 |
| 导出功能 | 支持导出为 HTML、PDF、PPTX | P1 |

### 1.4 技术栈

**前端技术栈**
```
- Next.js 15 + TypeScript 5.0
- React 18 (App Router)
- Tailwind CSS 4.0 + shadcn/ui (UI 组件)
- Zustand 5.0 (客户端状态管理)
- TanStack Query 5.0 (服务端状态管理)
- Framer Motion 12.0 (动画)
- SSE (Server-Sent Events 实时通信)
```

**后端技术栈**
```
- Python 3.11
- FastAPI 0.109 (Web 框架)
- OpenAI SDK 1.10 (Agent 核心)
- SQLAlchemy 2.0 + Alembic (ORM & 迁移)
- PostgreSQL 16 (数据库)
- Redis 7.2 (缓存 & 消息队列)
- Dramatiq 1.16 (异步任务队列)
- Pydantic 2.5 (数据验证)
```

**基础设施**
```
- Docker 24.0 + Docker Compose 2.23
- Nginx 1.25 (反向代理 & 静态文件)
- MinIO (对象存储)
- Sentry (错误监控)
```

---

## 2. 系统架构设计

### 2.1 整体架构图

```
┌────────────────────────────────────────────────────────────────┐
│                        客户端层 (Client)                        │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Next.js 15 Application (App Router)                      │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │ │
│  │  │  Chat      │  │   Thread   │  │  Tool Side │         │ │
│  │  │  History   │  │   View     │  │   Panel    │         │ │
│  │  └────────────┘  └────────────┘  └────────────┘         │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
          │ HTTPS / SSE
          ▼
┌────────────────────────────────────────────────────────────────┐
│                     网关层 (API Gateway)                        │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Nginx - 反向代理 & SSL/TLS 终止 & 负载均衡               │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
          │
          ▼
┌────────────────────────────────────────────────────────────────┐
│                     应用层 (Application)                        │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  FastAPI Application                                      │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │ │
│  │  │  Auth      │  │  Chats     │  │  Agent     │         │ │
│  │  │  Router    │  │  Router    │  │  Router    │         │ │
│  │  └────────────┘  └────────────┘  └────────────┘         │ │
│  │                                                            │ │
│  │  ┌────────────────────────────────────────────┐          │ │
│  │  │  Agent Core (OpenAI Function Calling)      │          │ │
│  │  └────────────────────────────────────────────┘          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Dramatiq Workers (Background Processing)                 │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
          │
          ▼
┌────────────────────────────────────────────────────────────────┐
│                     数据层 (Data Layer)                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐              │
│  │ PostgreSQL │  │   Redis    │  │   MinIO    │              │
│  │ (主数据)   │  │ (缓存/队列)│  │ (文件存储) │              │
│  └────────────┘  └────────────┘  └────────────┘              │
└────────────────────────────────────────────────────────────────┘
```

### 2.2 实时通信架构详情

#### 后端架构 (Python/FastAPI)

| 组件 | 技术选型 | 说明 |
|------|---------|------|
| Web服务器 | Gunicorn + Uvicorn Worker | 生产级 ASGI 服务器 |
| API框架 | FastAPI (ASGI) | 高性能异步框架 |
| 数据库 | PostgreSQL + Redis | 持久化 + 缓存/消息队列 |
| 流式响应 | StreamingResponse | Content-Type: text/event-stream |

#### 前端架构 (Next.js/React)

| 组件 | 技术选型 | 说明 |
|------|---------|------|
| 框架 | Next.js 15 (App Router) | React 全栈框架 |
| 实时通信 | EventSource API | 原生 SSE 客户端 |
| 状态管理 | React hooks (useAgentStream) | 自定义 Hook 封装 |
| 渲染优化 | requestAnimationFrame | 批量更新，避免频繁重绘 |

#### 消息流架构

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Agent Worker │───▶│ Redis PubSub │───▶│  SSE Stream  │───▶│ EventSource  │───▶│    React     │
│              │    │              │    │              │    │              │    │  Components  │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
       │                   │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼                   ▼
   异步任务            实时推送            流式响应           浏览器接收            UI更新
   
   Dramatiq          channel:            text/event-       onmessage         setState +
   后台执行          agent_run:id        stream            事件监听          requestAnimationFrame
```

#### 数据流详解

```
1. 用户发送消息
   │
   ▼
2. FastAPI 接收请求，创建 agent_run_id
   │
   ├──▶ 返回 agent_run_id 给前端
   │
   └──▶ Dramatiq Worker 异步执行 Agent
         │
         ▼
3. Agent 执行过程中，通过 Redis PubSub 发布事件
   │
   │    redis.publish(f"agent_run:{id}", json.dumps({
   │        "type": "tool_call_start",
   │        "payload": {...}
   │    }))
   │
   ▼
4. FastAPI SSE 端点订阅 Redis 频道
   │
   │    async def event_generator():
   │        pubsub = redis.pubsub()
   │        await pubsub.subscribe(channel)
   │        async for message in pubsub.listen():
   │            yield f"event: {msg_type}\ndata: {json_data}\n\n"
   │
   ▼
5. 前端 EventSource 接收并处理
   │
   │    const es = new EventSource(`/api/stream/agent/${id}`);
   │    es.addEventListener('tool_call_start', (e) => {
   │        const data = JSON.parse(e.data);
   │        // 使用 requestAnimationFrame 批量更新
   │        requestAnimationFrame(() => updateState(data));
   │    });
   │
   ▼
6. React 组件响应状态变化，更新 UI
```

#### SSE 消息类型

```typescript
type SSEMessageType = 
  | 'message'           // AI 文本响应片段
  | 'tool_call_start'   // 工具调用开始
  | 'tool_call_progress'// 工具执行进度
  | 'tool_call_complete'// 工具调用完成
  | 'slide_update'      // 幻灯片更新
  | 'error'             // 错误信息
  | 'done';             // 完成标记
```

#### 性能优化策略

| 优化点 | 实现方式 |
|-------|---------|
| 消息批处理 | requestAnimationFrame 合并多次更新 |
| 防抖渲染 | 文本流使用 100ms 防抖 |
| 虚拟滚动 | 长消息列表使用虚拟化 |
| 连接复用 | SSE 自动重连机制 |
| 内存管理 | 组件卸载时关闭 EventSource |

---

## 3. 数据库设计

### 3.1 ER 图

```
        ┌─────────────────┐
        │     Users       │
        │─────────────────│
        │ id (PK)         │
        │ email (UNIQUE)  │
        │ username        │
        │ password_hash   │
        │ avatar_url      │
        │ created_at      │
        │ updated_at      │
        └────────┬────────┘
                 │ 1:N
                 ▼
        ┌─────────────────┐
        │     Chats       │  ← 对话/会话记录
        │─────────────────│
        │ id (PK)         │
        │ user_id (FK)    │
        │ title           │  ← 自动生成的标题
        │ status          │
        │ created_at      │
        │ updated_at      │
        └────────┬────────┘
                 │ 1:N
        ┌────────┴────────┐
        ▼                 ▼
┌─────────────────┐  ┌─────────────────┐
│    Messages     │  │   ToolCalls     │
│─────────────────│  │─────────────────│
│ id (PK)         │  │ id (PK)         │
│ chat_id (FK)    │  │ chat_id (FK)    │
│ role            │  │ message_id (FK) │
│ content         │  │ tool_name       │
│ created_at      │  │ tool_params     │
└─────────────────┘  │ tool_result     │
                     │ status          │
                     │ execution_time  │
                     │ created_at      │
                     └────────┬────────┘
                              │ 1:1
                              ▼
                     ┌─────────────────┐
                     │     Slides      │  ← 生成的PPT
                     │─────────────────│
                     │ id (PK)         │
                     │ chat_id (FK)    │
                     │ index           │
                     │ html_content    │
                     │ thumbnail_url   │
                     │ created_at      │
                     └─────────────────┘
```

### 3.2 表结构 SQL

```sql
-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 对话表 (左侧历史记录)
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),  -- 自动根据首条消息生成
    status VARCHAR(50) DEFAULT 'active' 
        CHECK (status IN ('active', 'generating', 'completed', 'archived')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chats_user_id ON chats(user_id);
CREATE INDEX idx_chats_created_at ON chats(created_at DESC);

-- 消息表
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_chat_id ON messages(chat_id);

-- 工具调用表
CREATE TABLE tool_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    tool_name VARCHAR(100) NOT NULL,
    tool_params JSONB,
    tool_result JSONB,
    status VARCHAR(50) DEFAULT 'pending'
        CHECK (status IN ('pending', 'running', 'success', 'failed')),
    execution_time FLOAT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tool_calls_chat_id ON tool_calls(chat_id);

-- 幻灯片表
CREATE TABLE slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    index INT NOT NULL CHECK (index >= 0),
    html_content TEXT NOT NULL,
    thumbnail_url VARCHAR(500),
    style_config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(chat_id, index)
);

CREATE INDEX idx_slides_chat_id ON slides(chat_id);

-- 更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 4. 后端技术方案

### 4.1 项目结构

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI 应用入口
│   ├── config.py                   # 配置管理
│   │
│   ├── api/                        # API 路由
│   │   ├── auth.py                 # 认证 API
│   │   ├── chats.py                # 对话管理 API
│   │   ├── agent.py                # Agent 交互 API
│   │   └── streaming.py            # SSE 流式响应
│   │
│   ├── agent/                      # Agent 核心
│   │   ├── runner.py               # AgentRunner 主逻辑
│   │   ├── prompts.py              # 系统提示词
│   │   └── tools/                  # 工具函数
│   │       ├── registry.py
│   │       ├── search_images.py
│   │       ├── web_search.py
│   │       └── ppt_operations.py
│   │
│   ├── models/                     # 数据库模型
│   │   ├── user.py
│   │   ├── chat.py
│   │   ├── message.py
│   │   ├── tool_call.py
│   │   └── slide.py
│   │
│   ├── services/                   # 业务逻辑
│   │   ├── chat_service.py
│   │   └── streaming_service.py
│   │
│   ├── workers/                    # Dramatiq Workers
│   │   └── agent_worker.py
│   │
│   └── utils/
│       ├── redis_client.py
│       └── security.py
│
├── alembic/
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

### 4.2 核心代码实现

#### 4.2.1 SSE 流式响应

```python
# app/api/streaming.py
from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse
import asyncio
import json

from app.utils.redis_client import redis_client

router = APIRouter()

@router.get("/agent/{agent_run_id}")
async def stream_agent_response(agent_run_id: str):
    """SSE 端点：流式返回 Agent 执行结果"""
    
    async def event_generator():
        pubsub = redis_client.pubsub()
        channel = f"agent_run:{agent_run_id}"
        
        try:
            await pubsub.subscribe(channel)
            
            while True:
                message = await pubsub.get_message(
                    ignore_subscribe_messages=True,
                    timeout=1.0
                )
                
                if message and message['type'] == 'message':
                    data = json.loads(message['data'])
                    yield {
                        "event": data['type'],
                        "data": json.dumps(data['payload'])
                    }
                    
                    if data['type'] == 'done':
                        break
                        
                await asyncio.sleep(0.01)
                
        finally:
            await pubsub.unsubscribe(channel)
    
    return EventSourceResponse(event_generator())
```

#### 4.2.2 Agent Runner

```python
# app/agent/runner.py
from openai import AsyncOpenAI
from typing import List, Dict, Any
import json
import time

from app.config import settings
from app.agent.tools.registry import TOOLS_REGISTRY, TOOLS_DEFINITIONS
from app.agent.prompts import SYSTEM_PROMPT
from app.utils.redis_client import redis_client

class AgentRunner:
    """PPT 生成 Agent Runner"""
    
    def __init__(self, agent_run_id: str, chat_id: str):
        self.agent_run_id = agent_run_id
        self.chat_id = chat_id
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.channel = f"agent_run:{agent_run_id}"
    
    async def _publish(self, event_type: str, payload: dict):
        """发布 SSE 事件"""
        await redis_client.publish(
            self.channel,
            json.dumps({"type": event_type, "payload": payload})
        )
    
    async def run(self, user_message: str, history: List[Dict]) -> None:
        """执行 Agent 推理循环"""
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ] + history + [
            {"role": "user", "content": user_message}
        ]
        
        while True:
            response = await self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=messages,
                tools=TOOLS_DEFINITIONS,
                tool_choice="auto",
                stream=True
            )
            
            content = ""
            tool_calls = {}
            
            async for chunk in response:
                delta = chunk.choices[0].delta
                
                # 文本内容
                if delta.content:
                    content += delta.content
                    await self._publish("message", {"content": delta.content})
                
                # 工具调用
                if delta.tool_calls:
                    for tc in delta.tool_calls:
                        idx = tc.index
                        if idx not in tool_calls:
                            tool_calls[idx] = {"id": "", "name": "", "arguments": ""}
                            await self._publish("tool_call_start", {
                                "tool_index": idx,
                                "tool_name": tc.function.name if tc.function else ""
                            })
                        if tc.id:
                            tool_calls[idx]["id"] = tc.id
                        if tc.function:
                            if tc.function.name:
                                tool_calls[idx]["name"] = tc.function.name
                            if tc.function.arguments:
                                tool_calls[idx]["arguments"] += tc.function.arguments
                
                # 完成检查
                if chunk.choices[0].finish_reason == "tool_calls":
                    # 执行工具
                    for idx, tc in tool_calls.items():
                        result = await self._execute_tool(tc, idx)
                        messages.append({
                            "role": "assistant",
                            "tool_calls": [{
                                "id": tc["id"],
                                "type": "function",
                                "function": {"name": tc["name"], "arguments": tc["arguments"]}
                            }]
                        })
                        messages.append({
                            "role": "tool",
                            "tool_call_id": tc["id"],
                            "content": json.dumps(result)
                        })
                    tool_calls = {}
                    break
                    
                elif chunk.choices[0].finish_reason == "stop":
                    await self._publish("done", {"final_content": content})
                    return
    
    async def _execute_tool(self, tc: Dict, idx: int) -> Any:
        """执行工具调用"""
        start = time.time()
        args = json.loads(tc["arguments"])
        
        await self._publish("tool_call_progress", {
            "tool_index": idx,
            "tool_name": tc["name"],
            "status": "running",
            "params": args
        })
        
        try:
            result = await TOOLS_REGISTRY[tc["name"]](chat_id=self.chat_id, **args)
            await self._publish("tool_call_complete", {
                "tool_index": idx,
                "tool_name": tc["name"],
                "status": "success",
                "result": result,
                "execution_time": time.time() - start
            })
            return result
        except Exception as e:
            await self._publish("tool_call_complete", {
                "tool_index": idx,
                "tool_name": tc["name"],
                "status": "failed",
                "error": str(e),
                "execution_time": time.time() - start
            })
            return {"error": str(e)}
```

---

## 5. 前端设计方案

### 5.1 项目结构

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # 根布局
│   │   ├── page.tsx                  # 首页 (重定向到 /chat)
│   │   ├── globals.css
│   │   │
│   │   ├── chat/                     # 主聊天页面
│   │   │   ├── layout.tsx            # 聊天布局 (含侧边栏)
│   │   │   ├── page.tsx              # 新对话页面
│   │   │   └── [id]/
│   │   │       └── page.tsx          # 具体对话页面
│   │   │
│   │   ├── auth/                     # 认证页面
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   │
│   │   └── api/                      # API Routes (可选)
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui 基础组件
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── skeleton.tsx
│   │   │
│   │   ├── layout/                   # 布局组件
│   │   │   ├── Sidebar.tsx           # 左侧边栏容器
│   │   │   ├── ChatHistory.tsx       # 对话历史列表
│   │   │   ├── UserMenu.tsx          # 用户菜单
│   │   │   └── Header.tsx            # 顶部导航
│   │   │
│   │   ├── chat/                     # 聊天相关组件
│   │   │   ├── ChatContainer.tsx     # 聊天主容器
│   │   │   ├── MessageList.tsx       # 消息列表
│   │   │   ├── MessageItem.tsx       # 单条消息
│   │   │   ├── ChatInput.tsx         # 输入框
│   │   │   ├── WelcomeScreen.tsx     # 新对话欢迎页
│   │   │   └── TypingIndicator.tsx   # 打字指示器
│   │   │
│   │   ├── tool-panel/               # 🔥 工具调用侧边栏
│   │   │   ├── ToolSidePanel.tsx     # 侧边栏容器
│   │   │   ├── ToolCallCard.tsx      # 工具调用卡片
│   │   │   ├── ToolCallButton.tsx    # 消息中的工具按钮
│   │   │   └── tool-views/           # 各工具详情视图
│   │   │       ├── ImageSearchView.tsx
│   │   │       ├── WebSearchView.tsx
│   │   │       ├── SlidePreviewView.tsx
│   │   │       └── DefaultView.tsx
│   │   │
│   │   └── slides/                   # PPT 预览组件
│   │       ├── SlidePreview.tsx
│   │       ├── SlideCarousel.tsx
│   │       └── SlideEditor.tsx
│   │
│   ├── hooks/
│   │   ├── useAgentStream.ts         # SSE 流式处理
│   │   ├── useChats.ts               # 对话列表
│   │   ├── useMessages.ts            # 消息数据
│   │   └── useToolPanel.ts           # 工具面板
│   │
│   ├── stores/                       # Zustand 状态
│   │   ├── chatStore.ts              # 当前对话状态
│   │   ├── toolPanelStore.ts         # 工具面板状态
│   │   └── uiStore.ts                # UI 状态
│   │
│   ├── lib/
│   │   ├── api.ts                    # API 客户端
│   │   ├── utils.ts                  # 工具函数
│   │   └── constants.ts              # 常量
│   │
│   └── types/
│       ├── chat.ts
│       ├── message.ts
│       └── tool.ts
│
├── public/
├── package.json
├── tailwind.config.ts
└── next.config.js
```

---

## 6. 界面设计与交互

### 6.1 整体布局设计

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ┌───────────────┐ ┌─────────────────────────────────────┐ ┌───────────────┐ │
│ │               │ │                                     │ │               │ │
│ │   LEFT        │ │          MAIN CHAT AREA             │ │   RIGHT       │ │
│ │   SIDEBAR     │ │                                     │ │   TOOL PANEL  │ │
│ │               │ │                                     │ │               │ │
│ │  ┌─────────┐  │ │  ┌─────────────────────────────┐   │ │  (点击工具    │ │
│ │  │ New Chat│  │ │  │                             │   │ │   按钮后展开) │ │
│ │  └─────────┘  │ │  │      Message List           │   │ │               │ │
│ │               │ │  │                             │   │ │               │ │
│ │  Today        │ │  │  ┌─────────────────────┐   │   │ │               │ │
│ │  ├─ AI发展PPT │ │  │  │ User: 帮我做PPT    │   │   │ │               │ │
│ │  ├─ 产品介绍  │ │  │  └─────────────────────┘   │   │ │               │ │
│ │               │ │  │                             │   │ │               │ │
│ │  Yesterday    │ │  │  ┌─────────────────────┐   │   │ │               │ │
│ │  ├─ 年度总结  │ │  │  │ AI: 正在搜索...    │   │   │ │               │ │
│ │  ├─ 培训材料  │ │  │  │ [search_images] ←点击│   │   │ │               │ │
│ │               │ │  │  └─────────────────────┘   │   │ │               │ │
│ │  Previous 7d  │ │  │                             │   │ │               │ │
│ │  ├─ ...       │ │  └─────────────────────────────┘   │ │               │ │
│ │               │ │                                     │ │               │ │
│ │               │ │  ┌─────────────────────────────┐   │ │               │ │
│ │  ┌─────────┐  │ │  │  [输入消息...]        [发送]│   │ │               │ │
│ │  │ 用户头像 │  │ │  └─────────────────────────────┘   │ │               │ │
│ │  │ Settings│  │ │                                     │ │               │ │
│ │  └─────────┘  │ │                                     │ │               │ │
│ └───────────────┘ └─────────────────────────────────────┘ └───────────────┘ │
│    260px                      flex-1                          400px        │
│                                                           (条件渲染)        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 配色方案 (Dark Mode 优先)

```css
/* 参考 Suna 的现代暗色主题 */
:root {
  /* 背景色 */
  --bg-primary: #0a0a0a;      /* 主背景 - 近乎纯黑 */
  --bg-secondary: #111111;    /* 次级背景 - 侧边栏 */
  --bg-tertiary: #1a1a1a;     /* 卡片/输入框背景 */
  --bg-hover: #252525;        /* 悬浮状态 */
  --bg-active: #2a2a2a;       /* 选中状态 */
  
  /* 边框 */
  --border-subtle: #222222;   /* 细微边框 */
  --border-default: #333333;  /* 默认边框 */
  
  /* 文字 */
  --text-primary: #fafafa;    /* 主文字 */
  --text-secondary: #a1a1a1;  /* 次级文字 */
  --text-muted: #666666;      /* 弱化文字 */
  
  /* 强调色 */
  --accent-primary: #3b82f6;  /* 蓝色主色 */
  --accent-success: #22c55e;  /* 成功绿色 */
  --accent-warning: #f59e0b;  /* 警告橙色 */
  --accent-error: #ef4444;    /* 错误红色 */
  
  /* 渐变 */
  --gradient-subtle: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%);
}

/* 亮色模式 */
[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --border-subtle: #e5e7eb;
}
```

### 6.3 核心组件实现

#### 6.3.1 聊天布局

```tsx
// app/chat/layout.tsx
import { Sidebar } from '@/components/layout/Sidebar';
import { ToolSidePanel } from '@/components/tool-panel/ToolSidePanel';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[var(--bg-primary)]">
      {/* 左侧边栏 - 对话历史 */}
      <Sidebar />
      
      {/* 主聊天区域 */}
      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>
      
      {/* 右侧工具面板 - 条件渲染 */}
      <ToolSidePanel />
    </div>
  );
}
```

#### 6.3.2 左侧边栏 - 对话历史

```tsx
// components/layout/Sidebar.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  MessageSquare, 
  ChevronLeft, 
  Settings, 
  MoreHorizontal,
  Trash2,
  Edit2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChats } from '@/hooks/useChats';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Sidebar() {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { chats, isLoading, currentChatId } = useChats();
  
  // 按日期分组
  const groupedChats = groupChatsByDate(chats);
  
  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 260 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={cn(
        'flex flex-col h-full',
        'bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)]'
      )}
    >
      {/* 顶部区域 */}
      <div className="p-3 flex items-center justify-between">
        {!isCollapsed && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-semibold text-[var(--text-primary)]"
          >
            PPT Agent
          </motion.span>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8"
        >
          <ChevronLeft className={cn(
            'h-4 w-4 transition-transform',
            isCollapsed && 'rotate-180'
          )} />
        </Button>
      </div>
      
      {/* 新建对话按钮 */}
      <div className="px-3 mb-2">
        <Button
          onClick={() => router.push('/chat')}
          className={cn(
            'w-full justify-start gap-2',
            'bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90',
            isCollapsed && 'justify-center px-0'
          )}
        >
          <Plus className="h-4 w-4" />
          {!isCollapsed && <span>New Chat</span>}
        </Button>
      </div>
      
      {/* 对话列表 */}
      <ScrollArea className="flex-1 px-2">
        {Object.entries(groupedChats).map(([group, items]) => (
          <div key={group} className="mb-4">
            {!isCollapsed && (
              <div className="px-2 py-1 text-xs font-medium text-[var(--text-muted)] uppercase">
                {group}
              </div>
            )}
            
            <div className="space-y-1">
              {items.map((chat) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  isActive={chat.id === currentChatId}
                  isCollapsed={isCollapsed}
                  onClick={() => router.push(`/chat/${chat.id}`)}
                />
              ))}
            </div>
          </div>
        ))}
      </ScrollArea>
      
      {/* 底部用户区域 */}
      <div className="p-3 border-t border-[var(--border-subtle)]">
        <UserMenu isCollapsed={isCollapsed} />
      </div>
    </motion.aside>
  );
}

// 单个对话项
function ChatItem({ 
  chat, 
  isActive, 
  isCollapsed, 
  onClick 
}: {
  chat: Chat;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  
  return (
    <div
      className={cn(
        'group relative flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer',
        'transition-colors duration-150',
        isActive 
          ? 'bg-[var(--bg-active)] text-[var(--text-primary)]' 
          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
      )}
      onClick={onClick}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      <MessageSquare className="h-4 w-4 flex-shrink-0" />
      
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate text-sm">
            {chat.title || 'New conversation'}
          </span>
          
          {/* 操作菜单 */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

// 用户菜单
function UserMenu({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div className={cn(
      'flex items-center gap-2',
      isCollapsed && 'justify-center'
    )}>
      <Avatar className="h-8 w-8">
        <AvatarImage src="/avatar.png" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
      
      {!isCollapsed && (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
            Username
          </p>
          <p className="text-xs text-[var(--text-muted)] truncate">
            Free Plan
          </p>
        </div>
      )}
      
      {!isCollapsed && (
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

// 按日期分组对话
function groupChatsByDate(chats: Chat[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);
  
  const groups: Record<string, Chat[]> = {
    'Today': [],
    'Yesterday': [],
    'Previous 7 Days': [],
    'Older': []
  };
  
  chats.forEach(chat => {
    const chatDate = new Date(chat.created_at);
    if (chatDate >= today) {
      groups['Today'].push(chat);
    } else if (chatDate >= yesterday) {
      groups['Yesterday'].push(chat);
    } else if (chatDate >= weekAgo) {
      groups['Previous 7 Days'].push(chat);
    } else {
      groups['Older'].push(chat);
    }
  });
  
  // 过滤空分组
  return Object.fromEntries(
    Object.entries(groups).filter(([_, items]) => items.length > 0)
  );
}
```

#### 6.3.3 聊天主界面

```tsx
// components/chat/ChatContainer.tsx
'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAgentStream } from '@/hooks/useAgentStream';
import { useToolPanelStore } from '@/stores/toolPanelStore';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { WelcomeScreen } from './WelcomeScreen';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatContainerProps {
  chatId?: string;
}

export function ChatContainer({ chatId }: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [agentRunId, setAgentRunId] = useState<string | null>(null);
  
  const { isOpen: isToolPanelOpen } = useToolPanelStore();
  
  // 自动滚动到底部
  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);
  
  // SSE 流处理
  useAgentStream({
    agentRunId,
    onMessage: (content) => {
      setStreamingContent(prev => prev + content);
    },
    onComplete: () => {
      if (streamingContent) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: streamingContent,
          created_at: new Date().toISOString()
        }]);
        setStreamingContent('');
      }
      setIsStreaming(false);
      setAgentRunId(null);
    }
  });
  
  // 发送消息
  const handleSend = async (content: string) => {
    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);
    
    // 调用 API
    const res = await fetch('/api/agent/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, message: content })
    });
    
    const data = await res.json();
    setAgentRunId(data.agent_run_id);
  };
  
  // 新对话显示欢迎页
  if (!chatId && messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col">
        <WelcomeScreen onSend={handleSend} />
      </div>
    );
  }
  
  return (
    <motion.div 
      className="flex-1 flex flex-col min-h-0"
      animate={{ 
        marginRight: isToolPanelOpen ? 400 : 0 
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* 消息区域 */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <MessageList 
            messages={messages}
            streamingContent={streamingContent}
            isStreaming={isStreaming}
          />
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      
      {/* 输入区域 */}
      <div className="border-t border-[var(--border-subtle)] p-4">
        <div className="max-w-3xl mx-auto">
          <ChatInput 
            onSend={handleSend}
            disabled={isStreaming}
          />
        </div>
      </div>
    </motion.div>
  );
}
```

#### 6.3.4 欢迎页面

```tsx
// components/chat/WelcomeScreen.tsx
'use client';

import { motion } from 'framer-motion';
import { Sparkles, Image, FileText, Presentation } from 'lucide-react';
import { ChatInput } from './ChatInput';

const SUGGESTIONS = [
  {
    icon: Presentation,
    title: '产品发布PPT',
    prompt: '帮我做一个新产品发布的PPT，包含产品特点、市场分析和定价策略'
  },
  {
    icon: FileText,
    title: '年度总结',
    prompt: '帮我制作2024年度工作总结PPT，需要包含关键业绩、项目亮点和明年规划'
  },
  {
    icon: Image,
    title: 'AI技术介绍',
    prompt: '做一个介绍人工智能发展历程的PPT，需要配图和时间线'
  }
];

export function WelcomeScreen({ onSend }: { onSend: (content: string) => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      {/* Logo & Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          PPT Agent
        </h1>
        <p className="text-[var(--text-secondary)] max-w-md">
          告诉我你想要什么样的PPT，我会自动搜索资料、找图片、设计排版
        </p>
      </motion.div>
      
      {/* 建议卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 w-full max-w-3xl"
      >
        {SUGGESTIONS.map((item, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSend(item.prompt)}
            className={`
              p-4 rounded-xl text-left
              bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]
              hover:border-[var(--accent-primary)]/50
              transition-colors duration-200
            `}
          >
            <item.icon className="w-5 h-5 text-[var(--accent-primary)] mb-2" />
            <h3 className="font-medium text-[var(--text-primary)] mb-1">
              {item.title}
            </h3>
            <p className="text-sm text-[var(--text-muted)] line-clamp-2">
              {item.prompt}
            </p>
          </motion.button>
        ))}
      </motion.div>
      
      {/* 输入框 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-2xl"
      >
        <ChatInput onSend={onSend} placeholder="描述你想要的PPT..." />
      </motion.div>
    </div>
  );
}
```

#### 6.3.5 聊天输入框

```tsx
// components/chat/ChatInput.tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, Mic, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ 
  onSend, 
  disabled, 
  placeholder = '输入消息...' 
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // 自动调整高度
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, []);
  
  const handleSubmit = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  return (
    <div className={cn(
      'relative flex items-end gap-2 p-3 rounded-2xl',
      'bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]',
      'focus-within:border-[var(--accent-primary)]/50',
      'transition-colors duration-200'
    )}>
      {/* 附件按钮 */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-9 w-9 flex-shrink-0"
      >
        <Paperclip className="h-4 w-4 text-[var(--text-muted)]" />
      </Button>
      
      {/* 输入框 */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          adjustHeight();
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className={cn(
          'flex-1 resize-none bg-transparent',
          'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
          'focus:outline-none',
          'max-h-[200px] py-2'
        )}
      />
      
      {/* 发送按钮 */}
      <motion.div whileTap={{ scale: 0.95 }}>
        {disabled ? (
          <Button 
            size="icon" 
            className="h-9 w-9 rounded-xl bg-red-500 hover:bg-red-600"
          >
            <StopCircle className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!value.trim()}
            className={cn(
              'h-9 w-9 rounded-xl',
              'bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </motion.div>
    </div>
  );
}
```

---

## 7. 工具调用与侧边栏面板

### 7.1 交互流程

```
1. Agent 调用工具
      │
      ▼
2. SSE 推送 tool_call_start 事件
      │
      ▼
3. 消息区域显示 [ToolCallButton] 
   (可点击的工具调用标签)
      │
      ▼
4. 自动/点击 → 右侧弹出 ToolSidePanel
      │
      ▼
5. 面板实时显示:
   - 工具名称 & 状态
   - 参数详情
   - 执行结果/错误
      │
      ▼
6. 工具完成后可查看详细结果
   (图片网格、搜索结果、PPT预览等)
```

### 7.2 核心组件

#### 7.2.1 工具面板状态

```typescript
// stores/toolPanelStore.ts
import { create } from 'zustand';

interface ToolCall {
  id: string;
  index: number;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  params?: Record<string, any>;
  result?: any;
  error?: string;
  executionTime?: number;
}

interface ToolPanelState {
  isOpen: boolean;
  selectedIndex: number | null;
  toolCalls: ToolCall[];
  
  openPanel: (index?: number) => void;
  closePanel: () => void;
  selectTool: (index: number) => void;
  addToolCall: (tool: Omit<ToolCall, 'id'>) => void;
  updateToolCall: (index: number, data: Partial<ToolCall>) => void;
  clearToolCalls: () => void;
}

export const useToolPanelStore = create<ToolPanelState>((set) => ({
  isOpen: false,
  selectedIndex: null,
  toolCalls: [],
  
  openPanel: (index) => set({ isOpen: true, selectedIndex: index ?? null }),
  closePanel: () => set({ isOpen: false }),
  selectTool: (index) => set({ selectedIndex: index, isOpen: true }),
  
  addToolCall: (tool) => set((state) => ({
    toolCalls: [...state.toolCalls, { ...tool, id: `tool-${Date.now()}` }]
  })),
  
  updateToolCall: (index, data) => set((state) => ({
    toolCalls: state.toolCalls.map(tc => 
      tc.index === index ? { ...tc, ...data } : tc
    )
  })),
  
  clearToolCalls: () => set({ toolCalls: [], selectedIndex: null })
}));
```

#### 7.2.2 消息中的工具按钮

```tsx
// components/tool-panel/ToolCallButton.tsx
'use client';

import { motion } from 'framer-motion';
import { 
  Image, 
  Search, 
  Globe, 
  FileText,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToolPanelStore } from '@/stores/toolPanelStore';

const TOOL_ICONS: Record<string, any> = {
  search_images: Image,
  web_search: Search,
  visit_page: Globe,
  insert_page: FileText,
  update_page: FileText,
};

const TOOL_LABELS: Record<string, string> = {
  search_images: '搜索图片',
  web_search: '网页搜索',
  visit_page: '访问页面',
  insert_page: '插入页面',
  update_page: '更新页面',
};

interface ToolCallButtonProps {
  index: number;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
}

export function ToolCallButton({ index, name, status }: ToolCallButtonProps) {
  const { selectTool, selectedIndex } = useToolPanelStore();
  const Icon = TOOL_ICONS[name] || FileText;
  const isSelected = selectedIndex === index;
  
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => selectTool(index)}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg',
        'text-sm font-medium transition-all',
        'border',
        
        // 状态样式
        status === 'pending' && 'bg-gray-500/10 border-gray-500/30 text-gray-400',
        status === 'running' && 'bg-blue-500/10 border-blue-500/30 text-blue-400',
        status === 'success' && 'bg-green-500/10 border-green-500/30 text-green-400',
        status === 'failed' && 'bg-red-500/10 border-red-500/30 text-red-400',
        
        // 选中样式
        isSelected && 'ring-2 ring-[var(--accent-primary)]'
      )}
    >
      {/* 状态图标 */}
      {status === 'running' ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : status === 'success' ? (
        <CheckCircle className="w-4 h-4" />
      ) : status === 'failed' ? (
        <XCircle className="w-4 h-4" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
      
      <span>{TOOL_LABELS[name] || name}</span>
    </motion.button>
  );
}
```

#### 7.2.3 右侧工具面板

```tsx
// components/tool-panel/ToolSidePanel.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToolPanelStore } from '@/stores/toolPanelStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// 工具视图组件
import { ImageSearchView } from './tool-views/ImageSearchView';
import { WebSearchView } from './tool-views/WebSearchView';
import { SlidePreviewView } from './tool-views/SlidePreviewView';
import { DefaultView } from './tool-views/DefaultView';

const TOOL_VIEWS: Record<string, React.ComponentType<any>> = {
  search_images: ImageSearchView,
  web_search: WebSearchView,
  insert_page: SlidePreviewView,
  update_page: SlidePreviewView,
};

export function ToolSidePanel() {
  const { isOpen, closePanel, selectedIndex, toolCalls } = useToolPanelStore();
  const selectedTool = toolCalls.find(tc => tc.index === selectedIndex);
  const ToolView = selectedTool ? (TOOL_VIEWS[selectedTool.name] || DefaultView) : null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 400, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={cn(
            'fixed right-0 top-0 h-full z-40',
            'bg-[var(--bg-secondary)] border-l border-[var(--border-subtle)]',
            'flex flex-col overflow-hidden'
          )}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <StatusBadge status={selectedTool?.status} />
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">
                  {getToolLabel(selectedTool?.name)}
                </h3>
                {selectedTool?.executionTime && (
                  <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                    <Clock className="w-3 h-3" />
                    <span>{selectedTool.executionTime.toFixed(2)}s</span>
                  </div>
                )}
              </div>
            </div>
            
            <Button variant="ghost" size="icon" onClick={closePanel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* 工具标签栏 (多个工具时显示) */}
          {toolCalls.length > 1 && (
            <div className="flex gap-1 p-2 border-b border-[var(--border-subtle)] overflow-x-auto">
              {toolCalls.map((tc) => (
                <ToolTab key={tc.index} tool={tc} isSelected={tc.index === selectedIndex} />
              ))}
            </div>
          )}
          
          {/* 内容区域 */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              {selectedTool && (
                <>
                  {/* 参数 */}
                  {selectedTool.params && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                        参数
                      </h4>
                      <pre className="p-3 rounded-lg bg-[var(--bg-tertiary)] text-xs text-[var(--text-primary)] overflow-auto">
                        {JSON.stringify(selectedTool.params, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {/* 工具特定视图 */}
                  {ToolView && (
                    <ToolView
                      params={selectedTool.params}
                      result={selectedTool.result}
                      status={selectedTool.status}
                      error={selectedTool.error}
                    />
                  )}
                  
                  {/* 错误信息 */}
                  {selectedTool.error && (
                    <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                      <p className="text-sm text-red-400">{selectedTool.error}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const config = {
    pending: { icon: Loader2, color: 'text-gray-400', bg: 'bg-gray-500/20' },
    running: { icon: Loader2, color: 'text-blue-400', bg: 'bg-blue-500/20', spin: true },
    success: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20' },
    failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
  }[status || 'pending'];
  
  const Icon = config.icon;
  
  return (
    <div className={cn('p-2 rounded-lg', config.bg)}>
      <Icon className={cn('w-5 h-5', config.color, config.spin && 'animate-spin')} />
    </div>
  );
}

function ToolTab({ tool, isSelected }: { tool: any; isSelected: boolean }) {
  const { selectTool } = useToolPanelStore();
  
  return (
    <button
      onClick={() => selectTool(tool.index)}
      className={cn(
        'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
        isSelected
          ? 'bg-[var(--accent-primary)] text-white'
          : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
      )}
    >
      {getToolLabel(tool.name)}
    </button>
  );
}

function getToolLabel(name?: string): string {
  const labels: Record<string, string> = {
    search_images: '图片搜索',
    web_search: '网页搜索',
    visit_page: '访问页面',
    insert_page: '插入页面',
    update_page: '更新页面',
    initialize_design: '初始化设计',
  };
  return labels[name || ''] || name || '工具详情';
}
```

#### 7.2.4 图片搜索视图

```tsx
// components/tool-panel/tool-views/ImageSearchView.tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ExternalLink, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ImageSearchViewProps {
  params?: { query: string };
  result?: Array<{
    url: string;
    thumbnail: string;
    title: string;
    width: number;
    height: number;
  }>;
  status: string;
}

export function ImageSearchView({ params, result, status }: ImageSearchViewProps) {
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());
  
  // 加载中状态
  if (status === 'running') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--text-muted)]">
          正在搜索: "{params?.query}"
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-video rounded-lg bg-[var(--bg-tertiary)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }
  
  // 无结果
  if (!result?.length) {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        未找到相关图片
      </p>
    );
  }
  
  // 图片网格
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-[var(--text-primary)]">
          找到 {result.length} 张图片
        </h4>
        {selectedImages.size > 0 && (
          <span className="text-xs text-[var(--accent-primary)]">
            已选择 {selectedImages.size} 张
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {result.map((img, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => {
              const newSet = new Set(selectedImages);
              if (newSet.has(idx)) newSet.delete(idx);
              else newSet.add(idx);
              setSelectedImages(newSet);
            }}
            className={cn(
              'group relative aspect-video rounded-lg overflow-hidden cursor-pointer',
              'border-2 transition-all',
              selectedImages.has(idx)
                ? 'border-[var(--accent-primary)]'
                : 'border-transparent hover:border-[var(--border-default)]'
            )}
          >
            <Image
              src={img.thumbnail || img.url}
              alt={img.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            
            {/* 选中标记 */}
            {selectedImages.has(idx) && (
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[var(--accent-primary)] flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
            
            {/* 悬浮信息 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="text-xs text-white truncate">{img.title}</p>
                <p className="text-xs text-white/70">{img.width}×{img.height}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
```

#### 7.2.5 网页搜索视图

```tsx
// components/tool-panel/tool-views/WebSearchView.tsx
'use client';

import { motion } from 'framer-motion';
import { ExternalLink, FileText } from 'lucide-react';

interface WebSearchViewProps {
  params?: { queries: string[] };
  result?: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  status: string;
}

export function WebSearchView({ params, result, status }: WebSearchViewProps) {
  if (status === 'running') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--text-muted)]">
          正在搜索: {params?.queries?.join(', ')}
        </p>
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 rounded-lg bg-[var(--bg-tertiary)] animate-pulse">
            <div className="h-4 bg-[var(--bg-hover)] rounded w-3/4 mb-2" />
            <div className="h-3 bg-[var(--bg-hover)] rounded w-full" />
          </div>
        ))}
      </div>
    );
  }
  
  if (!result?.length) {
    return <p className="text-sm text-[var(--text-muted)]">未找到相关内容</p>;
  }
  
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-[var(--text-primary)]">
        搜索结果 ({result.length})
      </h4>
      
      {result.map((item, idx) => (
        <motion.a
          key={idx}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className={cn(
            'block p-3 rounded-lg',
            'bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]',
            'hover:border-[var(--accent-primary)]/50 transition-colors'
          )}
        >
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 mt-0.5 text-[var(--accent-primary)] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-medium text-[var(--text-primary)] truncate">
                {item.title}
              </h5>
              <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1">
                {item.snippet}
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
          </div>
        </motion.a>
      ))}
    </div>
  );
}
```

---

## 8. Agent 工作流程

### 8.1 完整流程

```
用户: "帮我做一个AI发展历程的PPT"
  │
  ▼
┌────────────────────────────────────────────┐
│ 1. 前端发送 POST /api/agent/run            │
│    返回 agent_run_id                       │
└────────────────────────────────────────────┘
  │
  ▼
┌────────────────────────────────────────────┐
│ 2. 前端建立 SSE 连接                        │
│    GET /api/stream/agent/{agent_run_id}    │
└────────────────────────────────────────────┘
  │
  ▼
┌────────────────────────────────────────────┐
│ 3. Worker 执行 Agent                       │
│    │                                       │
│    ├─ tool_call_start: web_search         │
│    │   → 前端: 显示按钮，打开侧边栏         │
│    │                                       │
│    ├─ tool_call_complete: web_search      │
│    │   → 前端: 显示搜索结果                 │
│    │                                       │
│    ├─ tool_call_start: search_images      │
│    │   → 前端: 切换到图片搜索标签           │
│    │                                       │
│    ├─ tool_call_complete: search_images   │
│    │   → 前端: 显示图片网格                 │
│    │                                       │
│    ├─ tool_call_start: insert_page        │
│    │   → 前端: 显示页面生成进度             │
│    │                                       │
│    └─ done                                 │
│        → 前端: 显示完成，可预览 PPT         │
└────────────────────────────────────────────┘
```

---

## 9. API 接口文档

### 9.1 对话管理

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/chats | 获取对话列表 |
| POST | /api/chats | 创建新对话 |
| GET | /api/chats/{id} | 获取对话详情 |
| DELETE | /api/chats/{id} | 删除对话 |
| PATCH | /api/chats/{id} | 更新对话(重命名) |

### 9.2 Agent 接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/agent/run | 启动 Agent |
| GET | /api/stream/agent/{id} | SSE 流式响应 |

### 9.3 SSE 事件

| 事件 | 数据 |
|------|------|
| message | `{content: string}` |
| tool_call_start | `{tool_index, tool_name}` |
| tool_call_progress | `{tool_index, tool_name, status, params}` |
| tool_call_complete | `{tool_index, tool_name, status, result, execution_time}` |
| slide_update | `{slide_index, html_content}` |
| done | `{final_content}` |
| error | `{message}` |

---

## 10. 部署方案

### 10.1 Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ppt_agent
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ppt_agent
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7.2-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  backend:
    build: ./backend
    environment:
      - DATABASE_URL=postgresql+asyncpg://ppt_agent:${DB_PASSWORD}@postgres:5432/ppt_agent
      - REDIS_URL=redis://redis:6379/0
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - postgres
      - redis
    ports:
      - "8000:8000"

  worker:
    build: ./backend
    command: python -m dramatiq app.workers.agent_worker --processes 4 --threads 4
    environment:
      - DATABASE_URL=postgresql+asyncpg://ppt_agent:${DB_PASSWORD}@postgres:5432/ppt_agent
      - REDIS_URL=redis://redis:6379/0
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - backend

  frontend:
    build: ./frontend
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    ports:
      - "3000:3000"

  nginx:
    image: nginx:1.25-alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    ports:
      - "80:80"
      - "443:443"

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_PASSWORD}
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

---

## 11. 开发计划

### Phase 1: MVP (4周)

**Week 1-2: 基础架构**
- [ ] 后端: FastAPI + PostgreSQL + Redis
- [ ] 数据库模型 (User, Chat, Message, ToolCall, Slide)
- [ ] Dramatiq Worker 配置

**Week 3: Agent 核心**
- [ ] AgentRunner + OpenAI Function Calling
- [ ] SSE 流式响应
- [ ] 工具实现 (search_images, web_search, ppt_operations)

**Week 4: 前端核心**
- [ ] Next.js 项目 + Tailwind + shadcn/ui
- [ ] 左侧边栏 (对话历史)
- [ ] 聊天界面 + SSE Hook
- [ ] 工具侧边栏面板

### Phase 2: 完善功能 (3周)

**Week 5: 工具视图**
- [ ] ImageSearchView
- [ ] WebSearchView  
- [ ] SlidePreviewView

**Week 6: PPT 功能**
- [ ] 幻灯片预览
- [ ] 导出功能 (HTML/PDF/PPTX)

**Week 7: 用户体验**
- [ ] 暗色/亮色主题
- [ ] 移动端适配
- [ ] 错误处理优化

### Phase 3: 增强 (2周)

**Week 8-9:**
- [ ] 在线编辑器
- [ ] 性能优化
- [ ] 测试 & 文档

---

**文档完成** ✅