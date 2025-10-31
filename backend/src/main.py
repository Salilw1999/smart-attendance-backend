import sys
from pathlib import Path

# ✅ Ensure backend/src is added to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
import atexit

# ✅ Routers
from api.routes.attendance import router as attendance_router
from api.routes.auth import router as auth_router
from api.routes.students import router as students_router
from api.routes.camera_process import router as camera_process_router
from api.routes.class_routes import router as class_router
from api.routes.classroom_routes import router as classroom_router
from routes.upload_router import router as upload_router

# ✅ DB
from db.db import init_db

# ✅ Services
from services.process_cameras import run_camera_pass

# -----------------------------------
# APP CONFIGURATION
# -----------------------------------
app = FastAPI(title="Student Attendance API")

# ✅ CORS setupimport sys
from pathlib import Path

# ✅ Ensure backend/src is added to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes.attendance import router as attendance_router
from api.routes.auth import router as auth_router
from api.routes.students import router as students_router
from api.routes.camera_process import router as camera_process_router  # ✅ NEW
from routes.upload_router import router as upload_router
from api.routes.class_routes import router as class_router
from api.routes.classroom_routes import router as classroom_router
from db.db import init_db
from apscheduler.schedulers.background import BackgroundScheduler
from services.process_cameras import run_camera_pass
import atexit

app = FastAPI(title="Student Attendance API")

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Scheduler (runs every hour)
scheduler = BackgroundScheduler()
scheduler.add_job(run_camera_pass, 'cron', minute=0)
scheduler.start()
atexit.register(lambda: scheduler.shutdown())

@app.on_event("startup")
def startup_event():
    init_db()

# ✅ API Routes
app.include_router(attendance_router, prefix="/api/attendance", tags=["Attendance"])
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(students_router, prefix="/api/students", tags=["Students"])
app.include_router(upload_router, prefix="/api/upload", tags=["Upload"])
app.include_router(camera_process_router, prefix="/api/ai", tags=["AI Processing"])  # ✅ NEW
app.include_router(class_router)
app.include_router(classroom_router)
@app.get("/")
def root():
    return {"message": "Welcome to Student Attendance System ✅"}

from api.routes.class_routes import router as class_router
from api.routes.classroom_routes import router as classroom_router



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can replace '*' with specific domains if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Scheduler - runs every hour
scheduler = BackgroundScheduler()
scheduler.add_job(run_camera_pass, 'cron', minute=0)
scheduler.start()
atexit.register(lambda: scheduler.shutdown())

# ✅ Database initialization on startup
@app.on_event("startup")
def startup_event():
    init_db()

# -----------------------------------
# ROUTES
# -----------------------------------
app.include_router(attendance_router, prefix="/api/attendance", tags=["Attendance"])
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(students_router, prefix="/api/students", tags=["Students"])
app.include_router(upload_router, prefix="/api/upload", tags=["Upload"])
app.include_router(camera_process_router, prefix="/api/ai", tags=["AI Processing"])
app.include_router(class_router)       # ✅ Added only once
app.include_router(classroom_router)   # ✅ Added only once

# ✅ Root endpoint
@app.get("/")
def root():
    return {"message": "Welcome to Student Attendance System ✅"}
