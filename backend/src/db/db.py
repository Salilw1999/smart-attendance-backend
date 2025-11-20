from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import sys
from pathlib import Path

# ✅ Ensure project root is in Python path (helps with Docker imports)
sys.path.append(str(Path(__file__).resolve().parents[1]))

# ✅ Load DB URL from environment (.env or Docker Compose)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:password@db:5432/attendance_db"
)

# ✅ Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,        # check if DB connection is alive
    pool_size=10,              # connection pool size
    max_overflow=20            # additional connections if pool exhausted
)

# ✅ Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ✅ Base class for all ORM models
Base = declarative_base()


# ✅ Dependency: DB Session per request
def get_db():
    """Yields a database session for FastAPI dependency injection."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ✅ Initialize Database Schema
def init_db():
    """
    Imports all models and creates database tables.
    Call this function once during FastAPI startup.
    """
    try:
        # Import models (auto-registers them with Base)
        from db.models import (
            student_model,
            attendance_model,
            user_model,
            role_model,
            permission_model,
        )
        print("✅ Models imported successfully.")

        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully.")
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
