from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from db.db import get_db
from services.attendance_service import (
    create_attendance_record,
    get_attendance_records,
    export_attendance_to_excel,
)
from services.photo_service import upload_photo as service_upload_photo
from schemas.attendance_schema import AttendanceCreate, AttendanceResponse

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])


# ✅ Add new attendance record
@router.post("/", response_model=AttendanceResponse)
def add_attendance(attendance: AttendanceCreate, db: Session = Depends(get_db)):
    """
    Create a new attendance record for a student.
    """
    try:
        return create_attendance_record(db=db, attendance=attendance)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to add attendance: {str(e)}")


# ✅ Get all attendance records
@router.get("/", response_model=list[AttendanceResponse])
def list_attendance(db: Session = Depends(get_db)):
    """
    Fetch all attendance records.
    """
    try:
        return get_attendance_records(db=db)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch attendance: {str(e)}")


# ✅ Export attendance to Excel
@router.get("/export")
def export_attendance(db: Session = Depends(get_db)):
    """
    Export all attendance records to an Excel file.
    """
    try:
        file_path = export_attendance_to_excel(db=db)
        return FileResponse(
            path=file_path,
            filename="attendance_records.xlsx",
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to export attendance: {str(e)}")


# ✅ Upload attendance photo
@router.post("/photo")
async def upload_photo(
    student_id: int = Form(..., description="Student ID for attendance"),
    file: UploadFile = File(..., description="Photo file to upload"),
    db: Session = Depends(get_db),
):
    """
    Upload a photo for a student's attendance.
    Automatically linked to their latest or ongoing attendance record.
    """
    try:
        photo_url = await service_upload_photo(file=file, student_id=student_id, db=db)
        return {"photo_url": photo_url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Photo upload failed: {str(e)}")
