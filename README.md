# Code Coven - Project Setup Guide

A full-stack web application built with React Native/Expo (frontend) and FastAPI (backend), designed for junior developers to learn and grow. IF YOU ARE LOST ON SET UP, YOU SHOULD TALK WITH YOUR AI CODING ASSISTANT ABOUT THE APP AND WHAT IS REQUIRED TO SET UP. ASK IT QUESTIONS ABOUT HOW AND WHY YOU SHOULD FOLLOW X PROCESS.

## 🚀 Prerequisites

Before you begin, ensure you have the following installed:

- **Docker Desktop** (v20.10 or higher)
  - If your computer is outdated (intel mac usually) and cannot install docker desktop, reach out to your team leads ASAP.
- **Docker Compose** (v2.0 or higher)
- **Git**

Optional for local development:

- Node.js (v20 or higher)
- Python (v3.12 or higher)

## 📦 Quick Start

### 1. Clone the Repository

#### Using SSH (Recommended)

```bash
git clone git@github.com:Code-Campfire/Code-Coven.git
cd Code-Coven
```

### 2. Start All Services with Docker

#### First Time Setup

````bash
# Build and start all containers
docker-compose up --build



#### Subsequent Runs
```bash
# Start existing containers
docker-compose up

# Or in detached mode
docker-compose up -d
````

### 3. Verify Everything is Working

Open your browser and navigate to:

- **Frontend**: http://localhost:3000
  - You should see "Hello World"
  - Below it: "You are connected to the backend!" (in green)
- **Backend API Docs**: http://localhost:8000/docs

## 🛠 Service URLs & Ports

| Service           | URL/Port                   | Description                    |
| ----------------- | -------------------------- | ------------------------------ |
| Frontend          | http://localhost:3000      | React Native/Expo web app      |
| Backend API       | http://localhost:8000      | FastAPI REST API               |
| API Documentation | http://localhost:8000/docs | Interactive API docs (Swagger) |
| PostgreSQL        | localhost:5432             | Database                       |
| Redis             | localhost:6379             | Cache server                   |

## 🗄 Database Connection

Use these credentials to connect to PostgreSQL:

- **Host**: localhost
- **Port**: 5432
- **Database**: app_db
- **Username**: app_user
- **Password**: app_password

Example connection string:

```
postgresql://app_user:app_password@localhost:5432/app_db
```

## 💻 Development Commands

### Docker Commands

```bash
# View running containers
docker ps

# View container logs
docker-compose logs -f [service-name]
# Example: docker-compose logs -f backend

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Rebuild a specific service
docker-compose build [service-name]
# Example: docker-compose build frontend

# Access container shell
docker exec -it code-coven-backend-1 bash
docker exec -it code-coven-frontend-1 sh
```

### Local Development (Without Docker)

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
npm install
npm run web
```

## 📁 Project Structure

```
code-coven/
├── backend/           # FastAPI backend
│   ├── main.py       # Main application file
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
├── frontend/          # React Native/Expo frontend
│   ├── App.tsx       # Main React component
│   ├── package.json
│   ├── Dockerfile
│   └── .env
├── rundowns/         # Project documentation
│   └── initial-rundown.md
├── docker-compose.yml # Docker orchestration
└── README.md         # This file
```

## 🔧 Troubleshooting

### Containers won't start

```bash
# Check if ports are already in use
lsof -i :3000  # Frontend port
lsof -i :8000  # Backend port
lsof -i :5432  # PostgreSQL port

# Kill process using a port (example for port 3000)
kill -9 $(lsof -t -i:3000)
```

### Clean restart

```bash
# Stop everything and remove volumes
docker-compose down -v

# Remove all containers and images (nuclear option)
docker system prune -a

# Rebuild and start
docker-compose up --build
```

### View logs for debugging

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f
```

## 🧪 Testing the Setup

1. **Backend Health Check**:

   ```bash
   curl http://localhost:8000/api/health
   ```

   Expected response:

   ```json
   {
     "status": "connected",
     "message": "Backend is operational",
     "service": "FastAPI Backend"
   }
   ```

2. **Frontend Connection**:
   - Visit http://localhost:3000
   - Check browser console for any errors
   - Verify "You are connected to the backend!" appears

## 🎯 Next Steps for Junior Developers

1. **Explore the API**: Visit http://localhost:8000/docs to see the interactive API documentation
2. **Modify the Frontend**: Edit `frontend/App.tsx` to change the display text
3. **Add API Endpoints**: Modify `backend/main.py` to add new endpoints
4. **Database Integration**: Use PostgreSQL for data persistence
5. **Redis Caching**: Implement caching for frequently accessed data

## 📚 Additional Resources

- **Project Setup Guide**: See `rundowns/initial-rundown.md` for detailed technical specifications
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **Expo Documentation**: https://docs.expo.dev/
- **Docker Documentation**: https://docs.docker.com/

## 🤝 Contributing

This project is designed for junior developers to practice and learn. Feel free to:

- Add new features
- Improve existing code
- Fix bugs
- Update documentation

## ⚠️ Important Notes

- The frontend and backend run with hot-reload enabled for development
- All code changes will automatically restart the respective services
- Docker volumes persist database data between container restarts
- Use `docker-compose down -v` to completely reset the database

---

## 📋 AI Assistant Guidelines

**Important**: If you're using an AI coding assistant (Claude, Copilot, Cursor, etc.), please review the `CLAUDE.md` file in the root directory. It contains:

- Essential architectural patterns and design decisions
- Important development rules and constraints
- Guidelines for working with this codebase

Make sure to check the **Rules for AI Assistants** section at the bottom of CLAUDE.md for critical guidelines about git operations and database migrations.

---
