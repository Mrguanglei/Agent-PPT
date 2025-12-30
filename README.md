# PPT Agent - AI 智能PPT生成平台

基于先进AI技术的智能PPT生成平台，让创作专业演示文稿变得简单而高效。

## ✨ 核心特性

### 🤖 AI 驱动的创作
- **智能对话界面** - 像聊天一样轻松创建PPT
- **多工具集成** - 自动搜索图片、网页信息生成内容
- **实时协作** - WebSocket支持的实时交互
- **专业规划** - 系统化的PPT制作流程

### 🎨 设计与美学
- **18种配色方案** - 从商务到艺术的完整设计系统
- **瑞士平面设计** - 现代简约的专业视觉语言
- **响应式布局** - 完美适配各种屏幕尺寸
- **流畅动画** - 精心设计的用户体验

### 🛠️ 技术架构
- **全栈现代化** - React + FastAPI + PostgreSQL
- **类型安全** - 完整的TypeScript支持
- **高性能** - 异步架构和智能缓存
- **可扩展** - 模块化设计易于扩展

## 🚀 快速开始

### 环境要求
- **后端**: Python 3.11+, Node.js 18+ (可选)
- **前端**: Node.js 18+
- **数据库**: PostgreSQL 16+ 或 Docker
- **缓存**: Redis 7+ 或 Docker

### 一键启动 (推荐)
```bash
# 克隆项目
git clone <repository-url>
cd PPT-Agent

# 一键启动全栈应用
./start.sh
```

### 手动启动

#### 1. 启动后端
```bash
cd backend

# 使用Docker (推荐)
docker-compose up -d postgres redis minio
docker-compose run --rm backend alembic upgrade head
docker-compose up -d backend celery_worker

# 或手动启动
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. 启动前端
```bash
cd frontend
npm install
npm run dev
```

### 访问应用
- **应用首页**: http://localhost:5173
- **API文档**: http://localhost:8000/api/docs
- **MinIO控制台**: http://localhost:9000

## 📁 项目结构

```
PPT-Agent/
├── backend/                 # Python FastAPI 后端
│   ├── app/
│   │   ├── agent/          # AI Agent 核心逻辑
│   │   ├── api/            # REST API 路由
│   │   ├── models/         # SQLAlchemy 数据模型
│   │   ├── services/       # 业务逻辑服务
│   │   └── utils/          # 工具函数
│   ├── alembic/            # 数据库迁移
│   └── requirements.txt
│
├── frontend/                # React + TypeScript 前端
│   ├── src/
│   │   ├── components/     # React 组件
│   │   ├── pages/          # 页面组件
│   │   ├── store/          # Zustand 状态管理
│   │   ├── services/       # API 和 WebSocket 服务
│   │   └── utils/          # 工具函数
│   ├── package.json
│   └── tailwind.config.js
│
├── start.sh                 # 全栈启动脚本
├── docker-compose.yml       # (可选) 全栈Docker配置
└── README.md
```

## 🎯 核心功能详解

### AI Agent 对话系统
```
用户: "帮我创建一个关于人工智能发展趋势的PPT"

Agent思考: 📋 分析需求 → 🎨 选择设计风格 → 🖼️ 搜索素材 → 📝 生成内容

Agent: "我已经为您规划了8页的演示文稿，使用现代科技风格配色方案。
现在开始生成内容..."
```

### 智能工具集成
- **🔍 图片搜索** - SerpAPI自动搜索相关图片
- **🌐 网页搜索** - 获取最新信息和数据
- **📄 页面解析** - 提取网页详细内容
- **📋 规划工具** - 系统化PPT制作流程
- **🎨 设计生成** - 自动生成HTML幻灯片

### 专业设计系统
- **配色方案**: 暖色现代、冷色现代、深色矿物等18种
- **字体系统**: 商务、复古、活力三种风格
- **布局类型**: 封面页、内容页、图表页的专业布局
- **动画效果**: 流畅的Framer Motion动画

## 🛠️ 技术栈详解

### 后端技术栈
- **FastAPI** - 异步Web框架，性能卓越
- **SQLAlchemy 2.0** - 现代化ORM，支持异步
- **PostgreSQL** - 强大的关系型数据库
- **Redis** - 高性能缓存和消息队列
- **OpenAI GPT-4** - 先进的AI模型
- **Celery** - 分布式任务队列

### 前端技术栈
- **React 18** - 现代用户界面库
- **TypeScript** - 类型安全的JavaScript
- **Vite** - 闪电般的构建工具
- **Tailwind CSS** - 实用优先的CSS框架
- **Zustand** - 轻量级状态管理
- **React Query** - 强大的数据获取库

### DevOps & 部署
- **Docker** - 容器化部署
- **Nginx** - 反向代理和静态文件服务
- **PostgreSQL** - 数据持久化
- **Redis** - 缓存和会话存储
- **MinIO** - 对象存储

## 🔧 配置说明

### 环境变量
```bash
# 后端 (.env)
DATABASE_URL=postgresql+asyncpg://user:password@localhost/ppt_agent
REDIS_URL=redis://localhost:6379/0
OPENAI_API_KEY=your-api-key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4-turbo-preview
SERPAPI_KEY=your-serpapi-key

# 支持的API端点示例:
# OpenAI (官方): OPENAI_BASE_URL=https://api.openai.com/v1
# DeepSeek: OPENAI_BASE_URL=https://api.deepseek.com/v1
# Moonshot AI: OPENAI_BASE_URL=https://api.moonshot.cn/v1

# 前端 (.env)
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_BASE_URL=ws://localhost:8000
```

### 数据库初始化
```bash
cd backend
alembic upgrade head
```

## 📊 API 接口

### REST API 端点
```
POST   /api/auth/login          # 用户登录
POST   /api/auth/register       # 用户注册
GET    /api/projects/           # 获取项目列表
POST   /api/projects/           # 创建项目
GET    /api/slides/             # 获取幻灯片列表
POST   /api/slides/             # 创建幻灯片
```

### WebSocket 接口
```
ws://localhost:8000/api/agent/ws/{conversation_id}

消息类型:
- message: 文本消息
- tool_call_start: 工具调用开始
- tool_call_complete: 工具调用完成
- error: 错误消息
```

## 🎨 设计系统

### 配色方案示例
```typescript
const colorSchemes = {
  cool_modern_1: {
    background: '#FEFEFE',
    primary: '#44B54B',
    accent: '#1399FF'
  },
  dark_mineral_1: {
    background: '#162235',
    primary: '#FFFFFF',
    accent: '#37DCF2'
  }
  // ... 更多方案
}
```

### 布局类型
- **Minimalist-Typography-Center-Focus** - 简约居中
- **Vertical-Flow-Text-Top** - 垂直流动
- **Split-Tone-Image-Left-Text-Right** - 图左文右

## 🚀 性能优化

### 前端优化
- **代码分割** - 路由级别的懒加载
- **图片优化** - WebP格式和懒加载
- **缓存策略** - React Query智能缓存
- **动画优化** - GPU加速的变换动画

### 后端优化
- **异步处理** - 全面的async/await支持
- **连接池** - SQLAlchemy和Redis连接池
- **任务队列** - Celery分布式处理
- **缓存策略** - 多级缓存体系

## 🧪 测试

```bash
# 后端测试
cd backend
pytest tests/

# 前端测试
cd frontend
npm run test
```

## 📦 部署

### Docker 部署
```bash
# 全栈部署 (推荐)
docker-compose up -d

# 或使用启动脚本
./start.sh

# 单独部署
docker build -t ppt-agent-backend ./backend
docker build -t ppt-agent-frontend ./frontend
```

### 生产环境配置
```nginx
# Nginx 配置示例
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
    }
}
```

## 🤝 贡献指南

1. **Fork** 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 创建 **Pull Request**

### 开发规范
- 使用 **TypeScript** 编写代码
- 遵循 **ESLint** 和 **Prettier** 规范
- 编写完整的 **单元测试**
- 更新相应的 **文档**

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- **OpenAI** - 提供强大的GPT-4模型
- **React & FastAPI** - 优秀的开发框架
- **Tailwind CSS** - 美观实用的样式框架
- **Framer Motion** - 出色的动画库

## 📞 联系我们

- **项目主页**: [GitHub Repository]
- **问题反馈**: [Issues]
- **讨论交流**: [Discussions]

---

**🎉 让AI帮你创建完美的演示文稿！**
