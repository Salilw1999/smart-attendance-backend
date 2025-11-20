from fastapi import APIRouter, HTTPException
from sqlalchemy import inspect
from db.db import engine, init_db

router = APIRouter(prefix="/api", tags=["Database"])

@router.post("/init-db")
def initialize_database():
    """
    ✅ Initialize the database tables (roles, users, permissions, etc.)
    - Safe to re-run: will not delete data
    - Returns the list of tables created or confirmed
    """
    try:
        # Run initialization (creates tables if not exist)
        init_db()

        # Inspect the database to confirm structure
        inspector = inspect(engine)
        tables = inspector.get_table_names()

        return {
            "status": "success",
            "message": "✅ Database initialized successfully.",
            "tables": tables,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database initialization failed: {e}")
