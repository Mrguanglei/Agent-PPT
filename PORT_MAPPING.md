# 端口映射配置

## 📋 端口变更说明

为了避免与其他服务冲突，所有服务的端口都已调整为不常用的端口。

## 🔄 端口映射表

| 服务 | 原始端口 | 新端口 | 说明 |
|------|----------|--------|------|
| **PostgreSQL** | 5432 | **15432** | 数据库服务 |
| **Redis** | 6379 | **16379** | 缓存服务 |
| **MinIO API** | 9000 | **19000** | 对象存储API |
| **MinIO Console** | 9001 | **19001** | 对象存储控制台 |
| **后端API** | 8000 | **18000** | FastAPI服务 |
| **前端应用** | **15173** | 5173 | React开发服务器 |
| **Nginx** | 80 | **8090** | 反向代理 |
| **Prometheus** | 9090 | **19090** | 监控数据收集 |
| **Grafana** | 3000 | **13000** | 监控可视化 |

## 🔄 完整端口列表

| 服务 | 宿主机端口 | 容器端口 | 用途 |
|------|------------|----------|------|
| PostgreSQL | 15432 | 5432 | 数据库 |
| Redis | 16379 | 6379 | 缓存 |
| MinIO API | 19000 | 9000 | 对象存储API |
| MinIO Console | 19001 | 9001 | 对象存储控制台 |
| 后端API | 18000 | 8000 | FastAPI服务 |
| 前端应用 | **15173** | 5173 | React开发服务器 |
| Nginx | 8090 | 80 | 反向代理 |
| Prometheus | 19090 | 9090 | 监控数据收集 |
| Grafana | 13000 | 3000 | 监控可视化 |

## 🌐 访问地址

### 开发环境
- **应用首页**: http://localhost:8090
- **前端开发服务器**: http://localhost:15173
- **API 文档**: http://localhost:18000/api/docs
- **MinIO 控制台**: http://localhost:19000 (admin/minioadmin)
- **Grafana**: http://localhost:13000 (admin/admin)
- **Prometheus**: http://localhost:19090

### 数据库连接
- **PostgreSQL**: localhost:15432
- **Redis**: localhost:16379

## ⚙️ 内部网络端口

Docker 容器内部网络仍使用标准端口，与宿主机端口映射无关：

- 容器内 PostgreSQL: 5432
- 容器内 Redis: 6379
- 容器内 MinIO: 9000/9001
- 容器内 后端: 8000
- 容器内 Nginx: 80
- 容器内 Prometheus: 9090
- 容器内 Grafana: 3000

## 🔧 配置更新

### 环境变量
```bash
# 更新后的配置
DATABASE_URL=postgresql+asyncpg://user:password@localhost:15432/ppt_agent
REDIS_URL=redis://localhost:16379/0
MINIO_ENDPOINT=localhost:19000
VITE_API_BASE_URL=http://localhost:18000
VITE_WS_BASE_URL=ws://localhost:18000
```

### CORS 配置
```python
CORS_ORIGINS=[
    "http://localhost:8090",
    "http://localhost:15173",
    "https://localhost:8090",
    "https://localhost:15173"
]
```

## 🚀 使用方法

### 启动服务
```bash
# 一键启动
./start.sh

# 或手动启动
docker-compose up -d
```

### 数据库连接 (外部工具)
```bash
# PostgreSQL
psql -h localhost -p 15432 -U ppt_user -d ppt_agent

# Redis
redis-cli -h localhost -p 16379
```

## 🔍 端口检查

### 检查端口占用
```bash
# 检查特定端口
sudo lsof -i :18000
sudo lsof -i :19000

# 检查所有新端口
for port in 15432 16379 19000 19001 18000 15173 8090 19090 13000; do
    if sudo lsof -i :$port > /dev/null; then
        echo "端口 $port 已被占用"
    else
        echo "端口 $port 可用"
    fi
done
```

## 📝 注意事项

1. **防火墙**: 确保新端口在防火墙中开放
2. **代理配置**: 更新任何反向代理或负载均衡器的配置
3. **客户端连接**: 更新所有连接字符串和配置
4. **文档同步**: 所有文档已同步更新新端口

## 🔄 回滚方法

如需回滚到原始端口，可以使用以下映射：

```bash
# 原始端口映射
15432 → 5432  # PostgreSQL
16379 → 6379  # Redis
19000 → 9000  # MinIO API
19001 → 9001  # MinIO Console
18000 → 8000  # 后端API
 8090 → 80    # Nginx
19090 → 9090  # Prometheus
13000 → 3000  # Grafana
```

现在所有端口都已调整完毕，避免了与其他服务的冲突！🎉
