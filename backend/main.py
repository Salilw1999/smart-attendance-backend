import sys
import os

# Add the backend/src directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), "src"))

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


@app.get("/")
def root():
    return {"message": "Welcome to the Student Attendance API"}