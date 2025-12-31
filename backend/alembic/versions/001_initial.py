"""Initial migration

Revision ID: 001
Revises:
Create Date: 2025-01-01

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('username', sa.String(100), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('avatar_url', sa.String(500), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_superuser', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

    # Create chats table
    op.create_table(
        'chats',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(255), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='active'),
        sa.Column('model_name', sa.String(100), nullable=True),
        sa.Column('metadata', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='cascade'),
    )
    op.create_index('ix_chats_user_id', 'chats', ['user_id'])
    op.create_index('ix_chats_created_at', 'chats', ['created_at'])

    # Create messages table
    op.create_table(
        'messages',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('chat_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('role', sa.String(20), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('prompt_tokens', sa.Text(), nullable=True),
        sa.Column('completion_tokens', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['chat_id'], ['chats.id'], ondelete='cascade'),
    )
    op.create_index('ix_messages_chat_id', 'messages', ['chat_id'])

    # Create tool_calls table
    op.create_table(
        'tool_calls',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('chat_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('message_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('tool_name', sa.String(100), nullable=False),
        sa.Column('tool_params', postgresql.JSONB(), nullable=True),
        sa.Column('tool_result', postgresql.JSONB(), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='pending'),
        sa.Column('execution_time', sa.Float(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('tool_call_id', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['chat_id'], ['chats.id'], ondelete='cascade'),
        sa.ForeignKeyConstraint(['message_id'], ['messages.id'], ondelete='cascade'),
    )
    op.create_index('ix_tool_calls_chat_id', 'tool_calls', ['chat_id'])
    op.create_index('ix_tool_calls_tool_call_id', 'tool_calls', ['tool_call_id'])

    # Create slides table
    op.create_table(
        'slides',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('chat_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('index', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(500), nullable=True),
        sa.Column('html_content', sa.Text(), nullable=False),
        sa.Column('thumbnail_url', sa.String(500), nullable=True),
        sa.Column('style_config', postgresql.JSONB(), nullable=True, server_default='{}'),
        sa.Column('raw_content', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['chat_id'], ['chats.id'], ondelete='cascade'),
    )
    op.create_index('ix_slides_chat_id', 'slides', ['chat_id'])
    op.create_unique_constraint('uq_slides_chat_id_index', 'slides', ['chat_id', 'index'])


def downgrade() -> None:
    op.drop_table('slides')
    op.drop_table('tool_calls')
    op.drop_table('messages')
    op.drop_table('chats')
    op.drop_table('users')
