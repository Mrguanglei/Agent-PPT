# PPT Agent

An AI-powered presentation creation platform using OpenAI Function Calling.

## Features

- 🤖 **AI-Powered**: Natural language to PPT generation
- 🔍 **Smart Research**: Web search and image search integration
- 📊 **Real-time Streaming**: SSE-based live updates
- 🎨 **Professional Design**: Multiple themes and layouts
- 📱 **Responsive UI**: Modern dark-mode interface

## Tech Stack

### Backend
- Python 3.11
- FastAPI 0.109
- PostgreSQL 16
- Redis 7.2
- Dramatiq (async workers)
- OpenAI API

### Frontend
- Next.js 15 (App Router)
- React 18
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui
- Framer Motion
- Zustand (state)
- TanStack Query

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- Docker & Docker Compose
- OpenAI API Key

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd PPT-agent
```

2. Copy environment files:
```bash
cp .env.example .env
cp frontend/.env.local.example frontend/.env.local
cp backend/.env.example backend/.env
```

3. Configure your `.env` file with your API keys.

4. Start with Docker Compose:
```bash
docker-compose up -d
```

5. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/docs

## Development

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Project Structure

```
PPT-agent/
├── backend/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── agent/        # Agent core (runner, tools)
│   │   ├── models/       # Database models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── workers/      # Dramatiq workers
│   │   └── utils/        # Utilities
│   ├── alembic/          # Database migrations
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js App Router
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks
│   │   ├── stores/       # Zustand stores
│   │   ├── lib/          # Utilities
│   │   └── types/        # TypeScript types
│   └── package.json
└── docker-compose.yml
```

## API Documentation

- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## License

MIT
