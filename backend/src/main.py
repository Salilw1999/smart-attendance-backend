import sys
from pathlib import Path

# Ensure the src directory is on sys.path so absolute imports like
# `models`, `services`, `db` resolve when running from backend/src
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes.attendance import router as attendance_router
from db.db import init_db

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    # Create DB tables on startup
    init_db()

# Mount the attendance router under /api/attendance
app.include_router(attendance_router, prefix="/api/attendance", tags=["attendance"])

# Authentication router
from api.routes.auth import router as auth_router
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])

# Students router
from api.routes.students import router as students_router
app.include_router(students_router, prefix="/api/students", tags=["students"])


@app.get("/")
def root():
    return {"message": "Welcome to the Student Attendance API"}