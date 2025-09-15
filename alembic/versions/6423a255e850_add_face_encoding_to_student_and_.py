from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '6423a255e850'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add face_encoding to students
    op.add_column('students', sa.Column('face_encoding', sa.JSON(), nullable=True))

    # Add face_encoding to attendance
    op.add_column('attendance', sa.Column('face_encoding', sa.JSON(), nullable=True))


def downgrade() -> None:
    # Remove columns on downgrade
    op.drop_column('attendance', 'face_encoding')
    op.drop_column('students', 'face_encoding')
