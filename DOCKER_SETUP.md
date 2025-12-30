# Docker 开发环境配置指南

## 📁 文件结构说明

```
PPT-Agent/
├── docker-compose.yml              # 🛠️ 开发环境配置
├── env.example                     # 📝 环境变量示例
└── start.sh                        # ⚡ 一键启动脚本
```

## 🚀 服务说明

`docker-compose.yml` 包含以下服务：

| 服务 | 端口 | 说明 |
|------|------|------|
| postgres | 15432 | PostgreSQL 数据库 |
| redis | 16379 | Redis 缓存 |
| minio | 19000/19001 | 对象存储 |
| backend | 18000 | FastAPI 后端 |
| frontend | 15173 | Vite 前端 |
| celery_worker | - | 异步任务处理器 |
| nginx | 8090 | 反向代理 |
| prometheus | 19090 | 监控数据收集 |
| grafana | 13000 | 监控可视化 |

## ⚙️ 环境变量配置

### `env.example` - 配置模板
```bash
# 复制并编辑
cp env.example .env

# 编辑你的配置
nano .env
```

### 必需的环境变量

#### 基础配置
```bash
DEBUG=true                    # 开发模式
APP_ENV=development          # 环境标识
HOST=0.0.0.0                 # 监听地址
PORT=8000                    # 端口
```

#### 数据库
```bash
DATABASE_URL=postgresql+asyncpg://ppt_user:password@localhost/ppt_agent
```

#### AI 服务 (支持自定义API端点)
```bash
OPENAI_API_KEY=sk-your-key           # API密钥
OPENAI_BASE_URL=https://api.openai.com/v1  # API基础URL
OPENAI_MODEL=gpt-4-turbo-preview     # 模型名称
SERPAPI_KEY=your-serpapi-key         # 图片搜索API密钥
```

**支持的自定义API端点示例:**
```bash
# 官方OpenAI
OPENAI_BASE_URL=https://api.openai.com/v1

# DeepSeek
OPENAI_BASE_URL=https://api.deepseek.com/v1

# Moonshot AI
OPENAI_BASE_URL=https://api.moonshot.cn/v1

# 其他兼容OpenAI接口的服务
OPENAI_BASE_URL=https://your-custom-endpoint.com/v1
```

#### 安全
```bash
SECRET_KEY=your-256-bit-key   # JWT签名密钥
```

#### 对象存储
```bash
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_ENDPOINT=localhost:19000
```

## 🚀 使用指南

### 开发环境 (推荐新手)

```bash
# 方式1: 使用启动脚本 (推荐)
./start.sh

# 方式2: 手动启动
cd backend
docker-compose up -d
```

### 生产环境

```bash
# 1. 配置环境变量
cp env.example .env.prod
# 编辑 .env.prod 文件

# 2. 启动生产环境
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# 3. 运行数据库迁移
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

## 🔧 服务说明

### 开发环境服务 (`docker-compose.yml`)

| 服务 | 端口 | 说明 |
|------|------|------|
| postgres | 15432 | PostgreSQL 数据库 |
| redis | 16379 | Redis 缓存 |
| minio | 19000/19001 | 对象存储 |
| backend | 18000 | FastAPI 后端 |
| frontend | 5173 | Vite 前端 |
| celery_worker | - | 异步任务处理器 |
| nginx | 8090 | 反向代理 |
| prometheus | 19090 | 监控数据收集 |
| grafana | 13000 | 监控可视化 |

### 生产环境服务 (`docker-compose.prod.yml`)

| 服务 | 端口 | 说明 |
|------|------|------|
| postgres | - | PostgreSQL 数据库 |
| redis | - | Redis 缓存 |
| minio | - | 对象存储 |
| backend | - | FastAPI 后端 |
| frontend | - | React 前端 |
| celery_worker | - | 异步任务处理器 |
| nginx | 80/443 | 反向代理 + SSL |
| prometheus | 9090 | 监控数据收集 |
| grafana | 3000 | 监控可视化 |

## 📊 访问地址

- **应用首页**: http://localhost:8090
- **API 文档**: http://localhost:18000/api/docs
- **MinIO 控制台**: http://localhost:19000 (admin/minioadmin)
- **Grafana**: http://localhost:13000 (admin/admin)
- **Prometheus**: http://localhost:19090

## 🐛 故障排除

### 常见问题

#### 端口冲突
```bash
# 检查端口占用
sudo lsof -i :5432
sudo lsof -i :6379
sudo lsof -i :18000

# 修改 docker-compose.yml 中的端口映射
```

#### 权限问题
```bash
# Linux 下可能需要
sudo chmod 666 /var/run/docker.sock
```

#### 内存不足
```bash
# 检查系统资源
docker system df

# 清理未使用的资源
docker system prune -a
```

#### 数据库连接失败
```bash
# 检查数据库容器状态
docker-compose logs postgres

# 手动连接测试
docker-compose exec postgres psql -U ppt_user -d ppt_agent
```

## 🔄 更新和维护

### 更新应用
```bash
# 停止服务
docker-compose down

# 拉取最新代码
git pull

# 重建镜像
docker-compose build --no-cache

# 启动服务
docker-compose up -d

# 运行迁移 (如果有数据库变更)
docker-compose exec backend alembic upgrade head
```

### 备份数据
```bash
# 备份数据库
docker-compose exec postgres pg_dump -U ppt_user ppt_agent > backup_$(date +%Y%m%d).sql

# 备份 MinIO 数据
docker-compose exec minio mc mirror /data ./minio-backup/
```

## 🎯 选择指南

| 场景 | 推荐配置 | 理由 |
|------|----------|------|
| **学习/开发** | `backend/docker-compose.yml` | 功能完整，易于调试 |
| **快速原型** | `./start.sh` | 一键启动，无需配置 |
| **生产部署** | `docker-compose.prod.yml` | 安全优化，性能更好 |
| **CI/CD** | `docker-compose.prod.yml` | 标准化部署流程 |

## 📞 获取帮助

如果遇到问题：

1. 查看服务日志: `docker-compose logs -f [service_name]`
2. 检查环境变量配置
3. 确认端口未被占用
4. 查看 [DEPLOYMENT.md](DEPLOYMENT.md) 获取详细部署指南
