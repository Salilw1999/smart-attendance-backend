from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel

from db.db import get_db
from models.student_model import Student
from models.attendance_model import Attendance
from models.class_model import Class
from models.classroom_model import Classroom

router = APIRouter(prefix="/attendance/manual", tags=["Manual Attendance"])


# ✅ Request model for marking attendance
class AttendanceRequest(BaseModel):
    student_id: int
    status: str


# ✅ Fetch students by class & classroom
@router.get("/students")
def get_students_for_class(
    class_id: int = Query(..., description="Selected Class ID"),
    classroom_id: int = Query(..., description="Selected Classroom ID"),
    db: Session = Depends(get_db),
):
    """
    Get all students for a specific class and classroom.
    """
    # Check class and classroom validity
    selected_class = db.query(Class).filter(Class.id == class_id).first()
    if not selected_class:
        raise HTTPException(status_code=404, detail="Class not found")

    selected_classroom = (
        db.query(Classroom)
        .filter(Classroom.id == classroom_id, Classroom.class_id == class_id)
        .first()
    )
    if not selected_classroom:
        raise HTTPException(status_code=404, detail="Classroom not found for this class")

    # ✅ Properly filter students by both class and classroom
    students = (
        db.query(Student)
        .filter(Student.class_id == class_id, Student.classroom_id == classroom_id)
        .order_by(Student.name.asc())
        .all()
    )

    # ✅ If no students found
    if not students:
        return {
            "message": f"No students found in {selected_class.name} - {selected_classroom.name}"
        }

    # ✅ Return structured student list
    return [
        {
            "id": s.id,
            "unique_number": s.unique_number,
            "name": s.name,
            "class_id": s.class_id,
            "class_name": selected_class.name,
            "classroom_id": s.classroom_id,
            "classroom_name": selected_classroom.name,
        }
        for s in students
    ]


# ✅ Mark manual attendance (create or update)
@router.post("/")
def mark_manual_attendance(data: AttendanceRequest, db: Session = Depends(get_db)):
    """
    Mark or update manual attendance for a student.
    """
    student = db.query(Student).filter(Student.id == data.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    today = datetime.now().date()

    # ✅ Check if already exists for today
    existing = (
        db.query(Attendance)
        .filter(Attendance.student_id == data.student_id, Attendance.date == today)
        .first()
    )

    # ✅ Update if exists
    if existing:
        existing.status = data.status
        db.commit()
        db.refresh(existing)
        return {
            "message": f"Updated {student.name}'s attendance to '{data.status}'",
            "student_id": student.id,
            "student_name": student.name,
            "class_id": student.class_id,
            "classroom_id": student.classroom_id,
            "date": str(today),
            "status": data.status,
        }

    # ✅ Create new attendance entry
    new_att = Attendance(
        student_id=data.student_id,
        date=today,
        status=data.status,
        confidence_score=None,
        captured_photo_url=None,
    )
    db.add(new_att)
    db.commit()
    db.refresh(new_att)

    return {
        "message": f"Marked {student.name} as '{data.status}'",
        "student_id": student.id,
        "student_name": student.name,
        "class_id": student.class_id,
        "classroom_id": student.classroom_id,
        "date": str(today),
        "status": data.status,
    }
