# backend/src/api/routes/camera_process.py
from fastapi import APIRouter
from services.process_cameras import run_camera_pass

router = APIRouter()

@router.post("/process-cameras")
def trigger_camera_processing():
    """
    Trigger AI camera image processing manually.
    This will detect faces & mark attendance.
    """
    run_camera_pass()
    return {"status": "camera processing started ✅"}
