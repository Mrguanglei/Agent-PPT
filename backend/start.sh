#!/bin/bash

# PPT Agent 后端启动脚本

set -e

echo "🚀 Starting PPT Agent Backend..."

# 检查环境变量
if [ ! -f .env ]; then
    echo "⚠️  .env file not found, copying from .env.example"
    cp .env.example .env
    echo "✏️  Please edit .env file with your configuration"
fi

# 启动Docker服务
echo "🐳 Starting Docker services..."
docker-compose up -d postgres redis minio

# 等待服务启动
echo "⏳ Waiting for services to be ready..."
sleep 10

# 运行数据库迁移
echo "🗄️  Running database migrations..."
alembic upgrade head

# 启动应用
echo "🌟 Starting application..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

echo "✅ PPT Agent Backend started successfully!"
echo "📖 API Documentation: http://localhost:18000/api/docs"
echo "🎯 Admin Interface: http://localhost:19001 (MinIO)"
