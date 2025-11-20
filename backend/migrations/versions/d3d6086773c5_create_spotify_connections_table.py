"""create
  spotify_connections table

Revision ID: d3d6086773c5
Revises: a192f6dcadde
Create Date: 2025-11-09 22:52:26.083801

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd3d6086773c5'
down_revision: Union[str, None] = 'a192f6dcadde'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
      op.create_table(
          'spotify_connections',
          sa.Column('id', sa.Integer(), nullable=False),
          sa.Column('user_id', sa.String(length=128), nullable=False),
          sa.Column('encrypted_refresh_token', sa.Text(), nullable=False),
          sa.Column('spotify_user_id', sa.String(length=128),
  nullable=True),
          sa.Column('connected_at', sa.TIMESTAMP(),
  server_default=sa.text('NOW()'), nullable=False),
          sa.Column('updated_at', sa.TIMESTAMP(),
  server_default=sa.text('NOW()'), nullable=False),
          sa.PrimaryKeyConstraint('id'),
          sa.UniqueConstraint('user_id')
      )


def downgrade() -> None:
      op.drop_table('spotify_connections')
