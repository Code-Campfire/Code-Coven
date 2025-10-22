"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# MoodLog Schemas
class MoodLogCreate(BaseModel):
    user_id: int
    mood_tags: Optional[List[str]] = None
    journal_entry: Optional[str] = None


class MoodLogResponse(BaseModel):
    id: int
    user_id: int
    mood_tags: Optional[List[str]]
    journal_entry: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# SpotifyTrack Schemas
class SpotifyTrackCreate(BaseModel):
    track_id: str
    track_name: str
    artist: str
    preview_url: Optional[str] = None


class SpotifyTrackResponse(BaseModel):
    id: int
    track_id: str
    track_name: str
    artist: str
    preview_url: Optional[str]

    class Config:
        from_attributes = True


# UserReaction Schemas
class UserReactionCreate(BaseModel):
    user_id: int
    mood_log_id: int
    track_id: int
    reaction_type: str


class UserReactionResponse(BaseModel):
    id: int
    user_id: int
    mood_log_id: int
    track_id: int
    reaction_type: str

    class Config:
        from_attributes = True
