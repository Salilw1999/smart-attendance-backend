from fastapi import APIRouter, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from ..services.attendance_service import AttendanceService
from ..schemas.attendance_schema import AttendanceCreate, AttendanceResponse
from ..db.db import get_db

router = APIRouter()

@router.post("/attendance", response_model=AttendanceResponse)
def create_attendance(attendance: AttendanceCreate, db: Session = next(get_db())):
    try:
        return AttendanceService.create_attendance(db=db, attendance=attendance)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/attendance/upload-photo")
def upload_photo(file: UploadFile = File(...), db: Session = next(get_db())):
    try:
        photo_url = AttendanceService.upload_photo(file=file, db=db)
        return {"photo_url": photo_url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/attendance/export")
def export_attendance(db: Session = next(get_db())):
    try:
        file_path = AttendanceService.export_attendance_to_excel(db=db)
        return {"file_path": file_path}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))