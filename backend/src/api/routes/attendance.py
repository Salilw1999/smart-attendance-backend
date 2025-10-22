from fastapi import APIRouter, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from ..db.db import get_db
from ..services.attendance_service import (
    create_attendance_record,
    get_attendance_records,
    export_attendance_to_excel,
)
from ..schemas.attendance_schema import AttendanceCreate, AttendanceResponse

router = APIRouter()

@router.post("/attendance", response_model=AttendanceResponse)
def add_attendance(attendance: AttendanceCreate, db: Session = next(get_db())):
    try:
        return create_attendance_record(db=db, attendance=attendance)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/attendance", response_model=list[AttendanceResponse])
def list_attendance(db: Session = next(get_db())):
    return get_attendance_records(db=db)

@router.post("/attendance/export")
def export_attendance(db: Session = next(get_db())):
    try:
        return export_attendance_to_excel(db=db)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/attendance/photo")
def upload_photo(file: UploadFile = File(...)):
    # Logic to handle photo upload to MinIO
    pass