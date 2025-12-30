#!/bin/bash

# PPT Agent 全栈应用启动脚本

set -e

echo "🚀 Starting PPT Agent Full Stack Application..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# 检查 Python
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.11+ first."
    exit 1
fi

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. Will start services manually."
    DOCKER_AVAILABLE=false
else
    DOCKER_AVAILABLE=true
fi

# 创建日志目录
mkdir -p logs

echo "🐳 Starting Backend Services..."

if [ "$DOCKER_AVAILABLE" = true ]; then
    echo "Using Docker Compose to start backend services..."
    cd backend

    # 启动基础设施服务
    docker-compose up -d postgres redis minio

    # 等待服务启动
    echo "⏳ Waiting for services to be ready..."
    sleep 15

    # 运行数据库迁移
    echo "🗄️  Running database migrations..."
    docker-compose run --rm backend alembic upgrade head

    # 启动后端应用
    echo "🌟 Starting backend application..."
    docker-compose up -d backend celery_worker

    cd ..
else
    echo "Starting backend services manually..."
    cd backend

    # 创建虚拟环境（如果不存在）
    if [ ! -d "venv" ]; then
        echo "🐍 Creating Python virtual environment..."
        python -m venv venv
    fi

    # 激活虚拟环境
    source venv/bin/activate

    # 安装依赖（如果需要）
    if [ ! -f ".deps_installed" ]; then
        echo "📦 Installing Python dependencies..."
        pip install -r requirements.txt
        touch .deps_installed
    fi

    # 设置环境变量
    if [ ! -f ".env" ]; then
        echo "📝 Setting up environment variables..."
        cp .env.example .env
        echo "⚠️  Please edit .env file with your configuration"
    fi

    # 启动后端应用（后台运行）
    echo "🌟 Starting backend application..."
    nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > ../logs/backend.log 2>&1 &

    cd ..
fi

echo "⚛️  Starting Frontend Application..."

cd frontend

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# 启动前端应用（后台运行）
echo "🌟 Starting frontend application..."
nohup npm run dev > ../logs/frontend.log 2>&1 &

cd ..

echo ""
echo "🎉 PPT Agent Full Stack Application Started Successfully!"
echo ""
echo "📊 Services Status:"
echo "  🐘 PostgreSQL: http://localhost:15432"
echo "  🔴 Redis: http://localhost:16379"
echo "  🗄️  MinIO: http://localhost:19000 (admin/minioadmin)"
echo "  🚀 Backend API: http://localhost:18000"
echo "  🌐 Frontend App: http://localhost:15173"
echo "  📖 API Docs: http://localhost:18000/api/docs"
echo ""
echo "📝 Log Files:"
echo "  Backend: logs/backend.log"
echo "  Frontend: logs/frontend.log"
echo ""
echo "🛑 To stop all services:"
echo "  docker-compose down  # (if using Docker)"
echo "  pkill -f 'uvicorn|vite'  # (if running manually)"
echo ""
echo "✨ Happy coding!"
