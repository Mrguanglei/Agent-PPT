# PPT Agent 前端

基于 React + TypeScript 的现代 Web 应用，为 PPT Agent 后端提供完整的用户界面。

## 技术栈

- **React 18** - 用户界面框架
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 快速构建工具
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Framer Motion** - 动画库
- **Zustand** - 轻量级状态管理
- **React Query** - 数据获取和缓存
- **React Router** - 路由管理
- **Reconnecting WebSocket** - WebSocket 连接
- **React Hot Toast** - 通知组件

## 核心功能

### 🎨 现代 UI 设计
- **Agent 交互式布局** - 类似 ChatGPT 的对话界面
- **响应式设计** - 支持桌面和移动设备
- **流畅动画** - 使用 Framer Motion 提供流畅的用户体验
- **深色/浅色主题** - 支持多种配色方案

### 🤖 实时 Agent 对话
- **WebSocket 连接** - 实时双向通信
- **流式消息** - 支持打字机效果的消息显示
- **工具调用指示器** - 可视化显示 AI 正在执行的操作
- **消息历史** - 完整的对话记录

### 📊 项目和幻灯片管理
- **项目列表** - 创建、编辑、删除项目
- **幻灯片预览** - 网格布局展示所有幻灯片
- **实时同步** - 与后端实时同步数据
- **批量操作** - 支持多项选择和批量处理

### 🔧 高级功能
- **拖拽排序** - 幻灯片顺序调整
- **缩略图生成** - 自动生成幻灯片预览图
- **素材管理** - 图片、图表、图标等素材资源
- **导出功能** - 支持多种格式导出

## 安装和运行

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
cd frontend
npm install
```

### 开发环境运行
```bash
npm run dev
```

应用将在 `http://localhost:5173` 上运行，并自动代理 API 请求到后端。

### 生产构建
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 项目结构

```
frontend/
├── src/
│   ├── components/           # React 组件
│   │   ├── Layout/          # 布局组件
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── Agent/           # Agent 对话组件
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── ToolCallIndicator.tsx
│   │   │   └── InputBar.tsx
│   │   ├── Slides/          # 幻灯片组件
│   │   │   ├── SlideGrid.tsx
│   │   │   ├── ThumbnailCard.tsx
│   │   ├── Projects/        # 项目组件
│   │   ├── Common/          # 通用组件
│   │   └── ui/              # UI 组件库
│   ├── pages/               # 页面组件
│   │   ├── HomePage.tsx
│   │   ├── ProjectPage.tsx
│   │   └── AuthPage.tsx
│   ├── hooks/               # 自定义 Hooks
│   │   ├── useAgent.ts
│   │   └── useWebSocket.ts
│   ├── store/               # Zustand 状态管理
│   │   ├── authStore.ts
│   │   ├── projectStore.ts
│   │   ├── agentStore.ts
│   │   └── slideStore.ts
│   ├── services/            # API 和 WebSocket 服务
│   │   ├── api.ts
│   │   └── websocket.ts
│   ├── utils/               # 工具函数
│   │   ├── html-processor.ts
│   │   ├── queryClient.ts
│   │   └── theme.ts
│   ├── types/               # TypeScript 类型定义
│   │   └── index.ts
│   ├── App.tsx              # 主应用组件
│   ├── main.tsx             # 应用入口
│   └── index.css            # 全局样式
├── public/                  # 静态资源
├── index.html               # HTML 模板
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 核心组件详解

### 布局系统
```typescript
// src/components/Layout/AppLayout.tsx
- 主布局容器
- 响应式侧边栏和头部
- 页面内容区域
```

### Agent 对话系统
```typescript
// src/components/Agent/ChatInterface.tsx
- 消息列表显示
- 实时消息接收
- 工具调用状态显示
- 输入框和发送功能
```

### 幻灯片管理
```typescript
// src/components/Slides/SlideGrid.tsx
- 幻灯片网格布局
- 缩略图预览
- 操作菜单（编辑、删除）
- 拖拽排序支持
```

### 状态管理
```typescript
// Zustand Stores
- useAuthStore: 用户认证状态
- useProjectStore: 项目管理状态
- useAgentStore: Agent 对话状态
- useSlideStore: 幻灯片管理状态
```

## API 集成

### REST API
- **认证**: `/api/auth/login`, `/api/auth/register`
- **项目**: `/api/projects/`
- **幻灯片**: `/api/slides/`
- **Agent**: `/api/agent/conversations`

### WebSocket
- **连接**: `ws://localhost:18000/api/agent/ws/{conversationId}`
- **消息类型**:
  - `message`: 文本消息
  - `tool_call_start`: 工具调用开始
  - `tool_call_complete`: 工具调用完成
  - `error`: 错误消息

## 主题和样式

### 配色方案
支持 18 种预设配色方案：
- 暖色现代系列
- 冷色现代系列
- 深色矿物系列
- 柔和中性系列
- 极简主义系列
- 暖色复古系列

### 字体方案
- **商务风格**: MiSans / Source Code Pro
- **复古精致**: Source Han Serif SC / Spectral
- **活力未来**: 抖音黑体 / BioRhyme

### 布局类型
- **封面页**: 简约居中、电影式叠加等
- **内容页**: 垂直流动、图左文右等
- **章节页**: 禅意留白、文字主导等
- **图表页**: 多图表画布、浮动数据等

## 开发指南

### 添加新组件
1. 在对应目录创建组件文件
2. 使用 TypeScript 确保类型安全
3. 遵循现有的命名和结构规范

### 添加新页面
1. 在 `pages/` 目录创建页面组件
2. 在 `App.tsx` 中添加路由
3. 使用布局组件包装页面内容

### 添加新 API
1. 在 `services/api.ts` 中添加 API 函数
2. 定义相应的 TypeScript 类型
3. 使用 React Query 进行数据获取

### 状态管理
1. 根据功能选择合适的 store
2. 使用 Zustand 的 devtools 进行调试
3. 保持状态的单一数据源

## 性能优化

### 代码分割
- 路由级别的代码分割
- 组件懒加载

### 缓存策略
- React Query 数据缓存
- 图片懒加载
- WebSocket 连接复用

### 动画优化
- 使用 `transform` 和 `opacity` 进行动画
- 避免在动画中使用布局属性
- 使用 `will-change` 属性优化

## 测试

```bash
# 运行所有测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行 E2E 测试
npm run test:e2e
```

## 部署

### 环境变量
```env
VITE_API_BASE_URL=http://localhost:18000
VITE_WS_BASE_URL=ws://localhost:18000
```

### Docker 部署
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

### Nginx 配置
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

[添加许可证信息]

## 致谢

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Zustand](https://zustand-demo.pmnd.rs/)
