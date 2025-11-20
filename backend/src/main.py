import sys
import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
import atexit

# -----------------------------------
# PATH SETUP
# -----------------------------------
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

# -----------------------------------
# ROUTER IMPORTS
# -----------------------------------
from api.routes.attendance import router as attendance_router
from api.routes.auth import router as auth_router
from api.routes.students import router as students_router
from api.routes.camera_process import router as camera_process_router
from api.routes.class_routes import router as class_router
from api.routes.classroom_routes import router as classroom_router
from api.routes.manual_attendance import router as manual_attendance_router
from routes.upload_router import router as upload_router
from api.routes.roles import router as role_router
from api.routes.users import router as user_router
from api.routes.permissions import router as permission_router
from api.routes.init_db import router as init_db_router

# -----------------------------------
# DATABASE
# -----------------------------------
from db.db import init_db

# -----------------------------------
# SERVICES
# -----------------------------------
from services.process_cameras import run_camera_pass

# -----------------------------------
# FASTAPI CONFIGURATION
# -----------------------------------
app = FastAPI(title="Student Attendance API")

# ✅ CORS setup — allow all origins (for local / LAN testing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            # 🔓 allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------
# BACKGROUND SCHEDULER (AI CAMERA LOOP)
# -----------------------------------
scheduler = BackgroundScheduler()

@app.on_event("startup")
def startup_event():
    """Initialize database and background camera scheduler"""
    print("🚀 Starting Student Attendance API backend...")

    try:
        init_db()
        print("✅ Database initialized successfully!")
    except Exception as e:
        print(f"❌ Database init failed: {e}")

    # 🧠 Run camera processing every hour
    if not scheduler.running:
        scheduler.add_job(run_camera_pass, "cron", minute=0)
        scheduler.start()
        atexit.register(lambda: scheduler.shutdown())
        print("📸 Background scheduler started.")

@app.on_event("shutdown")
def shutdown_event():
    """Cleanly shutdown background scheduler"""
    if scheduler.running:
        scheduler.shutdown()
        print("🛑 Scheduler stopped cleanly.")

# -----------------------------------
# ROUTER REGISTRATION
# -----------------------------------
app.include_router(attendance_router, prefix="/api/attendance", tags=["Attendance"])
app.include_router(auth_router)
app.include_router(students_router, prefix="/api/students", tags=["Students"])
app.include_router(upload_router, prefix="/api/upload", tags=["Upload"])
app.include_router(camera_process_router, prefix="/api/ai", tags=["AI Processing"])
app.include_router(class_router)
app.include_router(classroom_router)
app.include_router(manual_attendance_router)
app.include_router(role_router)
app.include_router(user_router)
app.include_router(permission_router)
app.include_router(init_db_router, prefix="/api/init-db", tags=["Database Init"])

# -----------------------------------
# ROOT ENDPOINT
# -----------------------------------
@app.get("/")
def root():
    return {"message": "Welcome to Student Attendance System ✅", "status": "running"}
