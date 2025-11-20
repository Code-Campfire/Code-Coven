from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict
import os
import secrets
from urllib.parse import urlencode
from fastapi import HTTPException, Request
from fastapi.responses import RedirectResponse
from cryptography.fernet import Fernet
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import redis
import sqlalchemy
from sqlalchemy import (
    create_engine,
    Table,
    Column,
    Integer,
    String,
    Text,
    TIMESTAMP,
    MetaData,
)

app = FastAPI(title="Backend API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment variables
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
SPOTIFY_REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379")

# Initialize Fernet encryption
cipher = Fernet(ENCRYPTION_KEY.encode())

# Redis connection for state management
redis_client = redis.from_url(REDIS_URL, decode_responses=True)

# Database setup
engine = create_engine(DATABASE_URL)
metadata = MetaData()

# Define spotify_connections table
spotify_connections = Table(
    "spotify_connections",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("user_id", String(128), unique=True, nullable=False),
    Column("encrypted_refresh_token", Text, nullable=False),
    Column("spotify_user_id", String(128)),
    Column("connected_at", TIMESTAMP),
    Column("updated_at", TIMESTAMP),
)

# Helper Functions


def encrypt_token(token: str) -> str:
    """Encrypt a token using Fernet"""
    return cipher.encrypt(token.encode()).decode()


def decrypt_token(encrypted_token: str) -> str:
    """Decrypt a token using Fernet"""
    return cipher.decrypt(encrypted_token.encode()).decode()


def generate_state() -> str:
    """Generate a random state parameter for CSRF protection"""
    return secrets.token_urlsafe(32)


def save_state(user_id: str, state: str):
    """Save state to Redis with 10 minute expiration"""
    # Store state -> user_id mapping (so we can look it up later)
    redis_client.setex(f"spotify_state:{state}", 600, user_id)


def verify_and_get_user(state: str) -> str:
    """Verify state parameter and return user_id"""
    user_id = redis_client.get(f"spotify_state:{state}")
    if user_id:
        redis_client.delete(f"spotify_state:{state}")  # Clean up after verification
        return user_id
    return None


# Spotify OAuth Endpoints


@app.get("/api/spotify/auth")
async def spotify_auth(user_id: str):
    """
    Initiates Spotify OAuth flow

    Args:
        user_id: The Firebase UID of the user connecting their Spotify account

    Returns:
        Redirects user to Spotify authorization page
    """
    # Generate and save state for CSRF protection
    state = generate_state()
    save_state(user_id, state)

    # Define the permissions we need from Spotify
    scopes = "playlist-modify-public playlist-modify-private"

    # Build the Spotify authorization URL
    auth_params = {
        "client_id": SPOTIFY_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": SPOTIFY_REDIRECT_URI,
        "scope": scopes,
        "state": state,
    }

    auth_url = f"https://accounts.spotify.com/authorize?{urlencode(auth_params)}"

    # Redirect user to Spotify
    return RedirectResponse(url=auth_url)


@app.get("/api/spotify/callback")
async def spotify_callback(code: str, state: str, error: str = None):
    """
    Handles Spotify OAuth callback

    Args:
        code: Authorization code from Spotify
        state: State parameter for CSRF verification
        error: Error from Spotify (if user denied)

    Returns:
        Success or error message
    """
    # Handle user denial
    if error:
        raise HTTPException(
            status_code=400, detail=f"Spotify authorization failed: {error}"
        )

    # Verify state and get user_id from Redis
    user_id = verify_and_get_user(state)
    if not user_id:
        raise HTTPException(
            status_code=400, detail="Invalid state parameter - possible CSRF attack"
        )

    try:
        # Exchange authorization code for tokens
        sp_oauth = SpotifyOAuth(
            client_id=SPOTIFY_CLIENT_ID,
            client_secret=SPOTIFY_CLIENT_SECRET,
            redirect_uri=SPOTIFY_REDIRECT_URI,
            scope="playlist-modify-public playlist-modify-private",
        )

        token_info = sp_oauth.get_access_token(code, as_dict=True, check_cache=False)

        if not token_info:
            raise HTTPException(
                status_code=400, detail="Failed to get access token from Spotify"
            )

        refresh_token = token_info["refresh_token"]
        access_token = token_info["access_token"]

        # Get Spotify user ID
        sp = spotipy.Spotify(auth=access_token)
        spotify_user = sp.current_user()
        spotify_user_id = spotify_user["id"]

        # Encrypt the refresh token
        encrypted_token = encrypt_token(refresh_token)

        # Save to database (upsert - overwrite if exists)
        with engine.connect() as conn:
            # Check if connection already exists
            select_stmt = spotify_connections.select().where(
                spotify_connections.c.user_id == user_id
            )
            existing = conn.execute(select_stmt).fetchone()

            if existing:
                # Update existing connection
                update_stmt = (
                    spotify_connections.update()
                    .where(spotify_connections.c.user_id == user_id)
                    .values(
                        encrypted_refresh_token=encrypted_token,
                        spotify_user_id=spotify_user_id,
                        updated_at=sqlalchemy.func.now(),
                    )
                )
                conn.execute(update_stmt)
            else:
                # Insert new connection
                insert_stmt = spotify_connections.insert().values(
                    user_id=user_id,
                    encrypted_refresh_token=encrypted_token,
                    spotify_user_id=spotify_user_id,
                )
                conn.execute(insert_stmt)

            conn.commit()

        return {
            "message": "Spotify connected successfully",
            "spotify_user_id": spotify_user_id,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error connecting to Spotify: {str(e)}"
        ) from e


@app.get("/api/spotify/status")
async def spotify_status(user_id: str):
    """
    Check if user has connected their Spotify account

    Args:
        user_id: The Firebase UID of the user

    Returns:
        Connection status and Spotify user ID if connected
    """
    try:
        with engine.connect() as conn:
            select_stmt = spotify_connections.select().where(
                spotify_connections.c.user_id == user_id
            )
            result = conn.execute(select_stmt).fetchone()

            if result:
                return {
                    "connected": True,
                    "spotify_user_id": result.spotify_user_id,
                    "connected_at": str(result.connected_at),
                }
            else:
                return {"connected": False}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error checking Spotify status: {str(e)}"
        ) from e


@app.delete("/api/spotify/disconnect")
async def spotify_disconnect(user_id: str):
    """
    Disconnect user's Spotify account

    Args:
        user_id: The Firebase UID of the user

    Returns:
        Success message
    """
    try:
        with engine.connect() as conn:
            # Delete the connection
            delete_stmt = spotify_connections.delete().where(
                spotify_connections.c.user_id == user_id
            )
            result = conn.execute(delete_stmt)
            conn.commit()

            if result.rowcount > 0:
                return {"message": "Spotify disconnected successfully"}
            else:
                raise HTTPException(
                    status_code=404, detail="No Spotify connection found for this user"
                )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error disconnecting Spotify: {str(e)}"
        ) from e


class HealthResponse(BaseModel):
    status: str
    message: str
    service: str


@app.get("/")
async def root() -> Dict[str, str]:
    return {"message": "Backend is running!"}


@app.get("/api/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    return HealthResponse(
        status="connected", message="Backend is operational", service="FastAPI Backend"
    )
