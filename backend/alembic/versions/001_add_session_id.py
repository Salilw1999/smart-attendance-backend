"""Add session_id to users table

Revision ID: 001
Create Date: 2025-10-27
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column('users', 
        sa.Column('session_id', sa.String(), nullable=True, unique=True)
    )
    op.create_index(op.f('ix_users_session_id'), 'users', ['session_id'], unique=True)

def downgrade():
    op.drop_index(op.f('ix_users_session_id'), table_name='users')
    op.drop_column('users', 'session_id')