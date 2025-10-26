# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Code Coven is a full-stack application designed for junior developers to learn and practice. It uses:
- **Frontend**: React Native/Expo Web (TypeScript)
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL 17
- **Cache**: Redis 7
- **Orchestration**: Docker Compose

## Essential Commands

### Development Workflow
```bash
# Start all services (first time)
docker-compose up --build

# Start existing containers
docker-compose up -d

# View logs
docker-compose logs -f backend  # Backend logs
docker-compose logs -f frontend # Frontend logs

# Restart after code changes
docker-compose restart backend  # Backend only
docker-compose restart frontend # Frontend only

# Complete reset (removes database data)
docker-compose down -v
docker-compose up --build
```

### Running Without Docker

Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Frontend:
```bash
cd frontend
npm install
npm run web
```

### Testing Connectivity
```bash
# Test backend health
curl http://localhost:8000/api/health

# Expected response:
# {"status":"connected","message":"Backend is operational","service":"FastAPI Backend"}
```

### Database Migrations (Alembic)

**First-time setup (already done):**
- Alembic is initialized in `backend/migrations/`
- Migration files are in `backend/migrations/versions/`

**Running migrations:**
```bash
# Apply all pending migrations to database
docker-compose exec backend alembic upgrade head

# Check current migration version
docker-compose exec backend alembic current

# View migration history
docker-compose exec backend alembic history
```

**Creating new migrations (when you change the schema):**
```bash
# Create a new migration file
docker-compose exec backend alembic revision -m "description of changes"

# Edit the generated file in backend/migrations/versions/
# Then run: alembic upgrade head
```

**Rolling back migrations:**
```bash
# Rollback one migration
docker-compose exec backend alembic downgrade -1

# Rollback all migrations
docker-compose exec backend alembic downgrade base
```

**For teammates:**
When you pull code that includes new migration files:
```bash
# Just run this to sync your database
docker-compose exec backend alembic upgrade head
```

## Architecture & Key Design Patterns

### Service Communication
- Frontend connects to backend via `EXPO_PUBLIC_API_URL` environment variable (default: http://localhost:8000)
- Backend exposes CORS-enabled REST API endpoints
- Health check pattern: Frontend displays connection status by polling `/api/health` endpoint on mount

### Docker Architecture
- All services defined in `docker-compose.yml` with explicit dependencies
- Frontend depends on backend, backend depends on postgres and redis
- Volumes used for:
  - Code hot-reloading (./backend:/app, ./frontend:/app)
  - Data persistence (postgres_data, redis_data)
  - Node modules isolation (/app/node_modules)

### Backend Structure
- Single `main.py` file currently - all endpoints should be added here until refactoring is needed
- FastAPI with Pydantic models for request/response validation
- CORS middleware configured to allow all origins in development
- Database URL injected via environment variable: `postgresql://app_user:app_password@postgres:5432/app_db`

### Frontend Structure
- Single `App.tsx` component - main entry point for the application
- Axios for API calls with environment-based URL configuration
- Connection status displayed using React hooks (useState, useEffect)

## Database Access
- **Connection String**: `postgresql://app_user:app_password@localhost:5432/app_db`
- **From Backend Container**: Use `postgres` as hostname instead of `localhost`
- **Credentials**: app_user / app_password / app_db

## Service URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs (auto-generated Swagger UI)
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Important Notes for Development
- Backend and frontend run with hot-reload enabled - changes auto-restart services
- Frontend .env variables must be prefixed with `EXPO_PUBLIC_` to be accessible
- Container names follow pattern: `code-coven-[service]-1`
- No test framework is currently configured - will need to be set up when tests are added

## Rules for AI Assistants

**CRITICAL: These rules must be followed without exception:**

1. **Git Operations**: NEVER perform git operations (commit, push, pull, merge, etc.) without explicit user request. The user must specifically ask for git operations to be performed.

2. **Database Migrations**: 
   - You can CREATE migration files if the user requests database changes
   - NEVER RUN migrations without explicit user request
   - Always ask for confirmation before executing any migration commands
   - The user must explicitly say "run the migration" or similar for migrations to be executed