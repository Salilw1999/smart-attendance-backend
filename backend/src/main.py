from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.src.api.routes.attendance import router as attendance_router
from backend.src.db.db import init_db

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await init_db()

app.include_router(attendance_router, prefix="/api/attendance", tags=["attendance"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Student Attendance API"}