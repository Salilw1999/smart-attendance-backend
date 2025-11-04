from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date, datetime
from pydantic import BaseModel

from db.db import get_db
from models.student_model import Student
from models.attendance_model import Attendance
from models.class_model import Class
from models.classroom_model import Classroom

router = APIRouter()  # ✅ no prefix here


# ✅ Request model
class AttendanceRequest(BaseModel):
    student_id: int
    status: str


# ✅ Get students for class/classroom
@router.get("/attendance/manual/students")
def get_students_for_class(
    class_id: int | None = Query(None, description="Optional Class ID"),
    classroom_id: int | None = Query(None, description="Optional Classroom ID"),
    db: Session = Depends(get_db),
):
    query = db.query(Student)
    if class_id is not None:
        query = query.filter(Student.class_id == class_id)
    if classroom_id is not None:
        query = query.filter(Student.classroom_id == classroom_id)

    students = query.order_by(Student.name.asc()).all()
    if not students:
        return {"message": "No students found for given filter"}

    result = []
    for s in students:
        class_name = db.query(Class.name).filter(Class.id == s.class_id).scalar() if s.class_id else None
        classroom_name = db.query(Classroom.name).filter(Classroom.id == s.classroom_id).scalar() if s.classroom_id else None

        result.append({
            "id": s.id,
            "unique_number": s.unique_number,
            "name": s.name,
            "class_id": s.class_id,
            "class_name": class_name,
            "classroom_id": s.classroom_id,
            "classroom_name": classroom_name,
        })

    return result


# ✅ Mark or update manual attendance
@router.post("/attendance/manual")
def mark_manual_attendance(data: AttendanceRequest, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == data.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    today = date.today()
    now_time = datetime.now().strftime("%H:%M:%S")

    class_name = db.query(Class.name).filter(Class.id == student.class_id).scalar() if student.class_id else None
    classroom_name = db.query(Classroom.name).filter(Classroom.id == student.classroom_id).scalar() if student.classroom_id else None

    existing = (
        db.query(Attendance)
        .filter(Attendance.student_id == data.student_id, Attendance.date == today)
        .first()
    )

    if existing:
        existing.status = data.status
        db.commit()
        db.refresh(existing)
        return {
            "message": f"✅ Updated {student.name}'s attendance to '{data.status}'",
            "student_id": student.id,
            "student_name": student.name,
            "class_id": student.class_id,
            "class_name": class_name,
            "classroom_id": student.classroom_id,
            "classroom_name": classroom_name,
            "date": str(today),
            "time": now_time,
            "status": data.status,
        }

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
        "message": f"✅ Marked {student.name} as '{data.status}'",
        "student_id": student.id,
        "student_name": student.name,
        "class_id": student.class_id,
        "class_name": class_name,
        "classroom_id": student.classroom_id,
        "classroom_name": classroom_name,
        "date": str(today),
        "time": now_time,
        "status": data.status,
    }

# ✅ View saved attendance records
@router.get("/api/attendance/records")
def get_attendance_records(
    class_id: int | None = Query(None, description="Filter by class ID"),
    classroom_id: int | None = Query(None, description="Filter by classroom ID"),
    db: Session = Depends(get_db),
):
    """
    View attendance records with optional filters for class and classroom.
    """
    query = (
        db.query(Attendance, Student, Class, Classroom)
        .join(Student, Attendance.student_id == Student.id)
        .outerjoin(Class, Student.class_id == Class.id)
        .outerjoin(Classroom, Student.classroom_id == Classroom.id)
    )

    if class_id:
        query = query.filter(Student.class_id == class_id)
    if classroom_id:
        query = query.filter(Student.classroom_id == classroom_id)

    records = query.order_by(Attendance.date.desc()).all()

    result = []
    for a, s, c, r in records:
        result.append({
            "student_id": s.id,
            "student_name": s.name,
            "unique_number": s.unique_number,
            "class_name": c.name if c else None,
            "classroom_name": r.name if r else None,
            "date": str(a.date),
            "status": a.status,
        })

    return result
