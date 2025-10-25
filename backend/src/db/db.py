from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@db:5432/attendance_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create database tables. Call on application startup."""
    # Import models so they are registered on the Base.metadata
    try:
        # Importing modules that define models registers them with Base
        import models.student_model  # noqa: F401
        import models.attendance_model  # noqa: F401
    except Exception:
        # If models are not present yet, ignore; metadata.create_all will still work if models imported elsewhere
        pass
    Base.metadata.create_all(bind=engine)