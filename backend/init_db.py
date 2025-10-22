"""
Database initialization script.
Run this script to create all database tables.

Usage:
    python init_db.py
"""
from database import engine, Base
from models import User, MoodLogs, SpotifyTracks, UserReactions  # Import all models here


def init_database():
    """Create all database tables."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

    # Print created tables
    print("\nCreated tables:")
    for table in Base.metadata.sorted_tables:
        print(f"  - {table.name}")


if __name__ == "__main__":
    init_database()
