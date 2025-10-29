import sys
from pathlib import Path

# ✅ Ensure backend/src is added to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes.attendance import router as attendance_router
from api.routes.auth import router as auth_router
from api.routes.students import router as students_router
from routes.upload_router import router as upload_router

from db.db import init_db


app = FastAPI(title="Student Attendance API")

# ✅ CORS (allow React access)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    init_db()


# ✅ API Routes (NO DUPLICATES!)
app.include_router(attendance_router, prefix="/api/attendance", tags=["Attendance"])
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(students_router, prefix="/api/students", tags=["Students"])
app.include_router(upload_router, prefix="/api/upload", tags=["Upload"])


@app.get("/")
def root():
    return {"message": "Welcome to Student Attendance System ✅"}
