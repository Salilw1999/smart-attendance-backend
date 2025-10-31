from fastapi import APIRouter, Depends, HTTPException, Form, Query
from sqlalchemy.orm import Session
from db.db import get_db
from models.student_model import Student
from models.attendance_model import Attendance
from datetime import datetime

router = APIRouter(prefix="/attendance/manual", tags=["Manual Attendance"])


@router.get("/students")
def get_students_for_class(
    class_name: str = Query(...),
    classroom: str = Query(...),
    db: Session = Depends(get_db)
):
    """Fetch students for selected class and classroom"""
    students = (
        db.query(Student)
        .filter(Student.class_name == class_name, Student.classroom == classroom)
        .order_by(Student.id.desc())
        .all()
    )
    return students


@router.post("/")
def mark_manual_attendance(
    student_id: int = Form(...),
    status: str = Form(...),
    db: Session = Depends(get_db)
):
    """Mark manual attendance for a student"""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Optional: check if attendance already exists for today
    today = datetime.now().date()
    existing = (
        db.query(Attendance)
        .filter(Attendance.student_id == student_id, Attendance.date == today)
        .first()
    )
    if existing:
        existing.status = status
        db.commit()
        db.refresh(existing)
        return {"message": f"Updated {student.name}'s attendance to {status}"}

    # Insert new attendance record
    new_att = Attendance(
        student_id=student_id,
        date=today,
        status=status,
        confidence_score=None,
        captured_photo_url=None,
    )
    db.add(new_att)
    db.commit()
    db.refresh(new_att)
    return {"message": f"Marked {student.name} as {status}"}
