from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from sqlalchemy.orm import Session
from db.db import get_db
from services.attendance_service import (
    create_attendance_record,
    get_attendance_records,
    export_attendance_to_excel,
)
from services.photo_service import upload_photo as service_upload_photo
from schemas.attendance_schema import AttendanceCreate, AttendanceResponse

router = APIRouter()


@router.post("/", response_model=AttendanceResponse)
def add_attendance(attendance: AttendanceCreate, db: Session = Depends(get_db)):
    try:
        return create_attendance_record(db=db, attendance=attendance)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=list[AttendanceResponse])
def list_attendance(db: Session = Depends(get_db)):
    return get_attendance_records(db=db)


@router.post("/export")
def export_attendance(db: Session = Depends(get_db)):
    try:
        return export_attendance_to_excel(db=db)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/photo")
def upload_photo(file: UploadFile = File(...), student_id: int | None = None, db: Session = Depends(get_db)):
    try:
        url = service_upload_photo(file=file, student_id=student_id, db=db)
        return {"photo_url": url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))