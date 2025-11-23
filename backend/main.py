from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Optional
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from sqlalchemy import create_engine, Column, String, DateTime, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime
import uuid
import os

# Initialize Firebase Admin SDK
try:
    firebase_admin.get_app()
except ValueError:
    # Initialize with service account credentials
    cred = credentials.Certificate('firebase-service-account.json')
    firebase_admin.initialize_app(cred)

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://app_user:app_password@postgres:5432/app_db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# User model
class User(Base):
    __tablename__ = "user"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    firebase_uid = Column(String(128), unique=True, nullable=False)
    email = Column(String(254), nullable=True)
    display_name = Column(String(100), nullable=True)
    created_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))

app = FastAPI(title="Backend API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthResponse(BaseModel):
    status: str
    message: str
    service: str

class UserInitRequest(BaseModel):
    id_token: str

class UserResponse(BaseModel):
    id: str
    firebase_uid: str
    email: Optional[str]
    display_name: Optional[str]
    created_at: str

@app.get("/")
async def root() -> Dict[str, str]:
    return {"message": "Backend is running!"}

@app.get("/api/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    return HealthResponse(
        status="connected",
        message="Backend is operational",
        service="FastAPI Backend"
    )

@app.get("/users/me", response_model=UserResponse)
async def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Get the current user's data from the database using their Firebase ID token.
    Expects: Authorization: Bearer <firebase_id_token>
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    id_token = authorization.split("Bearer ")[1]
    db = SessionLocal()

    try:
        # Verify the Firebase ID token
        try:
            decoded_token = firebase_auth.verify_id_token(id_token)
            firebase_uid = decoded_token['uid']
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Invalid Firebase token: {str(e)}")

        # Fetch user from database
        user = db.query(User).filter(User.firebase_uid == firebase_uid).first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found in database")

        return UserResponse(
            id=str(user.id),
            firebase_uid=user.firebase_uid,
            email=user.email,
            display_name=user.display_name,
            created_at=user.created_at.isoformat() if user.created_at else ""
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user: {str(e)}")
    finally:
        db.close()

@app.post("/users/init", response_model=UserResponse)
async def initialize_user(request: UserInitRequest):
    """
    Initialize a new user in the database after Firebase signup.
    Verifies the Firebase ID token and creates a user record in Postgres.
    """
    db = SessionLocal()
    try:
        # Verify the Firebase ID token
        try:
            decoded_token = firebase_auth.verify_id_token(request.id_token)
            firebase_uid = decoded_token['uid']
            email = decoded_token.get('email')
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Invalid Firebase token: {str(e)}")

        # Check if user already exists
        existing_user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
        if existing_user:
            # User already exists, return existing user data
            return UserResponse(
                id=str(existing_user.id),
                firebase_uid=existing_user.firebase_uid,
                email=existing_user.email,
                display_name=existing_user.display_name,
                created_at=existing_user.created_at.isoformat() if existing_user.created_at else ""
            )

        # Create new user in database
        new_user = User(
            firebase_uid=firebase_uid,
            email=email,
            display_name=email.split('@')[0] if email else None  # Use email prefix as default display name
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return UserResponse(
            id=str(new_user.id),
            firebase_uid=new_user.firebase_uid,
            email=new_user.email,
            display_name=new_user.display_name,
            created_at=new_user.created_at.isoformat() if new_user.created_at else ""
        )

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")
    finally:
        db.close()