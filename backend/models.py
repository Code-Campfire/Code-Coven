"""
SQLAlchemy database models.
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    """
    Example User model - represents a users table in the database.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"


class MoodLogs(Base):
    """
    MoodLogs model - stores user mood journal entries.
    """
    __tablename__ = "mood_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    mood_tags = Column(ARRAY(String), nullable=True)  # Array of mood tags like ["happy", "energetic"]
    journal_entry = Column(Text, nullable=True)  # Text field for longer journal entries
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship to User
    user = relationship("User", backref="mood_logs")

    def __repr__(self):
        return f"<MoodLogs(id={self.id}, user_id={self.user_id}, created_at='{self.created_at}')>"


class SpotifyTracks(Base):
    """
    SpotifyTracks model - stores Spotify track information.
    """
    __tablename__ = "spotify_tracks"

    id = Column(Integer, primary_key=True, index=True)
    track_id = Column(String, unique=True, index=True, nullable=False)  # Spotify's track ID
    track_name = Column(String, nullable=False)
    artist = Column(String, nullable=False)
    preview_url = Column(String, nullable=True)  # URL to 30-second preview

    def __repr__(self):
        return f"<SpotifyTracks(id={self.id}, track_name='{self.track_name}', artist='{self.artist}')>"


class UserReactions(Base):
    """
    UserReactions model - stores user reactions to tracks in mood logs.
    """
    __tablename__ = "user_reactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    mood_log_id = Column(Integer, ForeignKey("mood_logs.id"), nullable=False, index=True)
    track_id = Column(Integer, ForeignKey("spotify_tracks.id"), nullable=False, index=True)
    reaction_type = Column(String, nullable=False)  # e.g., "like", "love", "dislike"

    # Relationships
    user = relationship("User", backref="reactions")
    mood_log = relationship("MoodLogs", backref="reactions")
    track = relationship("SpotifyTracks", backref="reactions")

    def __repr__(self):
        return f"<UserReactions(id={self.id}, user_id={self.user_id}, reaction_type='{self.reaction_type}')>"
