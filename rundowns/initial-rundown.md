# Project Setup Guide

## Project Setup Guide

### Docker Configuration
- **Base Images**: `node:20-alpine` (frontend), `python:3.12-slim` (backend), `postgres:17-alpine` (database)
- **docker-compose.yml**: Define services for frontend (port 3000), backend (port 8000), PostgreSQL (port 5432), Redis cache

### Frontend - React Native/Expo Web
```
Dependencies & Versions:
- expo: ~51.0.0
- react: 18.3.1
- react-native: 0.76.0
- react-native-web: ~0.19.12
- firebase: ^10.13.0
- @react-navigation/native: ^6.1.18
- axios: ^1.7.7

Setup Commands:
npx create-expo-app frontend --template blank-typescript
cd frontend
npx expo install react-native-web react-dom @expo/metro-runtime
npm install firebase axios
```

### Backend - Python/FastAPI
```
Dependencies (requirements.txt):
fastapi==0.115.0
uvicorn==0.31.0
firebase-admin==6.5.0
python-dotenv==1.0.1
spotipy==2.24.0
redis==5.1.0
pydantic==2.9.0
asyncpg==0.30.0
sqlalchemy==2.0.35
alembic==1.14.0
psycopg2-binary==2.9.10

Setup:
python -m venv venv
pip install -r requirements.txt
```

### Firebase Setup
1. Create project at console.firebase.google.com
2. Enable Authentication (Email/Password + Google)
3. Generate service account key for backend
4. Get web config for frontend

### PostgreSQL Setup
Database Configuration:
- PostgreSQL 17 (latest stable)
- Default port: 5432
- Database name: app_db
- User: app_user
- Password: (set in docker-compose)

### Environment Variables
Frontend (.env):
- EXPO_PUBLIC_FIREBASE_* (config values)
- EXPO_PUBLIC_API_URL=http://localhost:8000

Backend (.env):
- FIREBASE_SERVICE_ACCOUNT_PATH
- SPOTIFY_CLIENT_ID/SECRET
- REDIS_URL
- DATABASE_URL=postgresql://app_user:password@postgres:5432/app_db

**Difficulty: 3/10** - Very straightforward stack for juniors. Main complexity will be Firebase auth flow between frontend/backend (not the setup itself).

**Better approach:** Consider Next.js instead of Expo Web - simpler deployment, better web performance, same React knowledge applies. Would reduce complexity to 2/10.