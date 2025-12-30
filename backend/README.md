# PPT Agent 后端

基于FastAPI的智能PPT生成平台后端服务。

## 技术栈

- **Python 3.11**
- **FastAPI** - 现代异步Web框架
- **SQLAlchemy 2.0** - 异步数据库ORM
- **PostgreSQL 16** - 主数据库
- **Redis 7.2** - 缓存和消息队列
- **OpenAI GPT-4** - AI模型
- **Celery** - 异步任务处理
- **MinIO** - 对象存储

## 功能特性

### 🔐 认证系统
- JWT令牌认证
- 用户注册/登录
- 密码加密存储

### 📊 项目管理
- 创建/编辑/删除PPT项目
- 项目状态跟踪
- 元数据管理

### 🎨 幻灯片管理
- 幻灯片CRUD操作
- 素材管理
- 批量操作支持

### 🤖 AI Agent
- 智能PPT生成
- 多工具集成 (图片搜索、网页搜索、内容生成)
- 实时流式响应
- WebSocket支持

### 🛠️ 工具集成
- **search_images**: SerpAPI图片搜索
- **web_search**: 网页信息搜索
- **visit_page**: 网页内容抓取
- **think**: AI推理工具，支持详细PPT规划
- **PPT操作**: 初始化、插入、更新、删除页面

## 安装和运行

### 使用Docker (推荐)

1. **克隆项目**
```bash
git clone <repository-url>
cd backend
```

2. **启动服务**
```bash
./start.sh
```

或者手动启动：
```bash
# 启动基础设施
docker-compose up -d postgres redis minio

# 运行迁移
alembic upgrade head

# 启动应用
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 手动安装

1. **创建虚拟环境**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate     # Windows
```

2. **安装依赖**
```bash
pip install -r requirements.txt
```

3. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件配置你的API密钥等
```

4. **运行数据库迁移**
```bash
alembic upgrade head
```

5. **启动应用**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## 配置说明

### 必需的环境变量

```env
# 数据库
DATABASE_URL=postgresql+asyncpg://user:password@localhost/ppt_agent

# Redis
REDIS_URL=redis://localhost:16379/0

# OpenAI
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview

# 搜索API
SERPAPI_KEY=your-serpapi-key-here

# JWT
SECRET_KEY=your-secret-key-here-change-in-production
```

### 可选配置

```env
# MinIO对象存储
MINIO_ENDPOINT=localhost:19000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# 应用配置
DEBUG=true
HOST=0.0.0.0
PORT=8000
```

## API文档

启动服务后访问：
- **Swagger UI**: http://localhost:18000/api/docs
- **ReDoc**: http://localhost:18000/api/redoc
- **健康检查**: http://localhost:18000/health

## API端点

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 项目管理
- `GET /api/projects/` - 获取用户项目列表
- `POST /api/projects/` - 创建新项目
- `GET /api/projects/{project_id}` - 获取项目详情
- `PUT /api/projects/{project_id}` - 更新项目
- `DELETE /api/projects/{project_id}` - 删除项目

### 幻灯片管理
- `GET /api/slides/?project_id=xxx` - 获取项目幻灯片
- `POST /api/slides/` - 创建幻灯片
- `GET /api/slides/{slide_id}?project_id=xxx` - 获取幻灯片详情
- `PUT /api/slides/{slide_id}?project_id=xxx` - 更新幻灯片
- `DELETE /api/slides/{slide_id}?project_id=xxx` - 删除幻灯片

### Agent交互
- `POST /api/agent/conversations` - 创建对话
- `GET /api/agent/conversations` - 获取对话列表
- `WEBSOCKET /api/agent/ws/{conversation_id}` - Agent WebSocket连接

## 项目结构

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI应用入口
│   ├── config.py              # 配置管理
│   ├── database.py            # 数据库连接
│   ├── dependencies.py        # 依赖注入
│   ├── api/                   # API路由
│   │   ├── auth.py
│   │   ├── projects.py
│   │   ├── slides.py
│   │   └── agent.py
│   ├── agent/                 # AI Agent核心
│   │   ├── core.py
│   │   ├── prompts.py
│   │   └── tools/
│   ├── models/                # 数据库模型
│   ├── schemas/               # Pydantic模式
│   ├── services/              # 业务逻辑
│   └── utils/                 # 工具函数
├── alembic/                   # 数据库迁移
├── tests/                     # 测试
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── start.sh
```

## PPT制作规划系统

### Think工具详解

系统集成了强大的PPT制作规划功能，通过`think`工具实现：

#### 🎯 规划模板结构

1. **需求分析**
   - 核心主题提取
   - 内容范围确定
   - 用户特殊要求识别

2. **视觉风格设计**
   - 配色方案选择（6种预设方案）
   - 字体方案选择（3种风格）
   - 整体视觉风格确定

3. **页面结构规划**
   - 总页数规划
   - 每页详细规划
   - 布局类型选择

4. **素材需求清单**
   - 图片素材需求
   - 图表素材需求
   - 图标素材需求

5. **技术实现要点**
   - HTML/CSS规范
   - 组件使用选择
   - 特殊处理方案

6. **质量检查清单**
   - 8个维度的质量检查
   - 自动化验证标准

#### 📐 布局类型系统

- **封面页**: Minimalist-Typography-Center-Focus, Cinematic-Image-Overlay等
- **内容页**: Vertical-Flow-Text-Top, Split-Tone-Image-Left-Text-Right等
- **章节页**: Zen-Negative-Space-Focus等
- **图表页**: Canvas-Integrated-Multi-Charts等

#### 🎨 配色方案系统

1. **暖色现代** - 背景:#F4F1E9, 主色:#15857A, 强调色:#FF6A3B
2. **冷色现代** - 背景:#FEFEFE, 主色:#44B54B, 强调色:#1399FF
3. **深色矿物** - 背景:#162235, 主色:#FFFFFF, 强调色:#37DCF2
4. **柔和中性** - 背景:#F7F3E6, 主色:#E7F177, 强调色:#106188
5. **极简主义** - 背景:#F3F1ED, 主色:#000000, 强调色:#D6C096
6. **暖色复古** - 背景:#F4EEEA, 主色:#882F1C, 强调色:#FEE79B

#### 🔧 工作流程

1. **信息收集阶段** (可选)
   - 使用web_search搜索相关信息
   - 使用visit_page访问重要网页
   - 使用search_images搜索图片素材(最多6次)

2. **PPT初始化阶段**
   - 使用think工具完成详细规划
   - 使用initialize_design创建PPT框架

3. **页面生成阶段**
   - 逐页使用insert_page生成内容
   - 根据规划模板确定每页布局和内容

4. **优化调整阶段** (根据需要)
   - 使用update_page修改内容
   - 使用remove_pages删除不需要的页面

## 开发指南

### 添加新工具

1. 在 `app/agent/tools/` 中创建工具函数
2. 在 `TOOLS_REGISTRY` 中注册
3. 在 `core.py` 的 `_register_tools` 中添加工具定义

### 添加新API端点

1. 在 `app/api/` 中创建路由文件
2. 在 `main.py` 中注册路由
3. 添加相应的服务和模式

### 数据库迁移

```bash
# 创建新迁移
alembic revision --autogenerate -m "migration message"

# 运行迁移
alembic upgrade head

# 回滚迁移
alembic downgrade -1
```

## 测试

```bash
pytest tests/
```

## 部署

### Docker生产部署

```bash
# 构建镜像
docker build -t ppt-agent-backend .

# 运行容器
docker run -p 18000:8000 --env-file .env ppt-agent-backend
```

### 使用Nginx反向代理

配置Nginx以代理到FastAPI应用，并启用WebSocket支持。

## 许可证

[添加许可证信息]

## 贡献

[添加贡献指南]