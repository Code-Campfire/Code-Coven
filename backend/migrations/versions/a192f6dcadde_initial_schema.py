"""initial schema

Revision ID: a192f6dcadde
Revises: 
Create Date: 2025-10-26 22:46:29.339177

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a192f6dcadde'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create user table
    op.create_table(
        'user',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('firebase_uid', sa.String(length=128), nullable=False),
        sa.Column('email', sa.String(length=254), nullable=True),
        sa.Column('display_name', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('firebase_uid')
    )

    # Create mood_tag table
    op.create_table(
        'mood_tag',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=64), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    # Create mood_log table
    op.create_table(
        'mood_log',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('mood_text', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_mood_log_user_created', 'mood_log', ['user_id', 'created_at'])

    # Create song table
    op.create_table(
        'song',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('spotify_id', sa.String(length=64), nullable=True),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('artist', sa.String(length=500), nullable=False),
        sa.Column('album', sa.String(length=500), nullable=True),
        sa.Column('image_url', sa.String(length=500), nullable=True),
        sa.Column('duration_ms', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('spotify_id')
    )

    # Create mood_log_tag table (many-to-many relationship)
    op.create_table(
        'mood_log_tag',
        sa.Column('mood_log_id', sa.UUID(), nullable=False),
        sa.Column('mood_tag_id', sa.UUID(), nullable=False),
        sa.Column('added_at', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['mood_log_id'], ['mood_log.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['mood_tag_id'], ['mood_tag.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('mood_log_id', 'mood_tag_id')
    )
    op.create_index('idx_mood_log_tag_tag', 'mood_log_tag', ['mood_tag_id'])

    # Create recommendation table
    op.create_table(
        'recommendation',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('mood_log_id', sa.UUID(), nullable=False),
        sa.Column('song_id', sa.UUID(), nullable=False),
        sa.Column('feedback', sa.String(length=10), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['mood_log_id'], ['mood_log.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['song_id'], ['song.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('mood_log_id')
    )
    op.create_index('idx_recommendation_song', 'recommendation', ['song_id'])

    # Create playlist table
    op.create_table(
        'playlist',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'name', name='unique_user_playlist_name')
    )

    # Create playlist_song table (many-to-many relationship)
    op.create_table(
        'playlist_song',
        sa.Column('playlist_id', sa.UUID(), nullable=False),
        sa.Column('song_id', sa.UUID(), nullable=False),
        sa.Column('added_at', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['playlist_id'], ['playlist.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['song_id'], ['song.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('playlist_id', 'song_id')
    )


def downgrade() -> None:
    # Drop tables in reverse order (to respect foreign key constraints)
    op.drop_table('playlist_song')
    op.drop_table('playlist')
    op.drop_table('recommendation')
    op.drop_table('mood_log_tag')
    op.drop_table('song')
    op.drop_table('mood_log')
    op.drop_table('mood_tag')
    op.drop_table('user')
