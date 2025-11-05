from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from datetime import datetime, date
from db.db import get_db
from services.attendance_service import (
    create_attendance_record,
    get_attendance_records,
    export_attendance_to_excel,
)
from services.photo_service import upload_photo as service_upload_photo
from schemas.attendance_schema import AttendanceCreate, AttendanceResponse
from models.attendance_model import Attendance
from models.student_model import Student

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])

# ✅ Add new attendance record
@router.post("/", response_model=AttendanceResponse)
def add_attendance(attendance: AttendanceCreate, db: Session = Depends(get_db)):
    """Create a new attendance record for a student."""
    try:
        return create_attendance_record(db=db, attendance=attendance)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to add attendance: {str(e)}")


# ✅ Unified endpoint for attendance listing
def _fetch_attendance_records(
    db: Session,
    class_id: int | None,
    classroom_id: int | None,
    start_date: datetime | None,
    end_date: datetime | None,
):
    """Shared logic for both `/` and `/records` routes."""
    try:
        return get_attendance_records(
            db=db,
            class_id=class_id,
            classroom_id=classroom_id,
            start_date=start_date,
            end_date=end_date,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch attendance: {str(e)}")


# ✅ Support `/api/attendance/`
@router.get("/", response_model=list[AttendanceResponse])
def list_attendance_root(
    db: Session = Depends(get_db),
    class_id: int | None = Query(None),
    classroom_id: int | None = Query(None),
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),
):
    """Fetch attendance records (base route)."""
    return _fetch_attendance_records(db, class_id, classroom_id, start_date, end_date)


# ✅ Support `/api/attendance/records`
@router.get("/records", response_model=list[AttendanceResponse])
def list_attendance_records(
    db: Session = Depends(get_db),
    class_id: int | None = Query(None),
    classroom_id: int | None = Query(None),
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),
):
    """Fetch attendance records (alias endpoint)."""
    return _fetch_attendance_records(db, class_id, classroom_id, start_date, end_date)


# ✅ Export attendance to Excel
@router.get("/export")
def export_attendance(
    db: Session = Depends(get_db),
    class_id: int | None = Query(None),
    classroom_id: int | None = Query(None),
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),
):
    """Export attendance records to Excel."""
    try:
        file_path = export_attendance_to_excel(
            db=db,
            class_id=class_id,
            classroom_id=classroom_id,
            start_date=start_date,
            end_date=end_date,
        )
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
    student_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload a photo for attendance."""
    try:
        photo_url = await service_upload_photo(file=file, student_id=student_id, db=db)
        return {"photo_url": photo_url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Photo upload failed: {str(e)}")


# ✅ Dashboard stats endpoint
@router.get("/stats")
def get_attendance_stats(db: Session = Depends(get_db)):
    """Return daily attendance summary stats."""
    try:
        today = date.today()
        total_students = db.query(Student).count()
        total_today = db.query(Attendance).filter(Attendance.date == today).count()
        present_today = db.query(Attendance).filter(
            Attendance.date == today, Attendance.status == "present"
        ).count()
        absent_today = db.query(Attendance).filter(
            Attendance.date == today, Attendance.status == "absent"
        ).count()

        return {
            "totalStudents": total_students,
            "todayAttendance": total_today,
            "presentToday": present_today,
            "absentToday": absent_today,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")
