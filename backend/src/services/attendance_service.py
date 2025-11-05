from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException

from sqlalchemy import and_
from datetime import datetime, date
from models.attendance_model import Attendance
from models.student_model import Student
from models.class_model import Class
from models.classroom_model import Classroom
from schemas.attendance_schema import AttendanceCreate
from utils.excel_exporter import export_attendance_to_excel as export_to_excel


# ✅ Create attendance record
def create_attendance_record(db: Session, attendance: AttendanceCreate):
    """Create a new attendance record for a student."""
    student = db.query(Student).filter(Student.id == attendance.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if hasattr(attendance, "class_id") and attendance.class_id:
        if not db.query(Class).filter(Class.id == attendance.class_id).first():
            raise HTTPException(status_code=404, detail="Class not found")

    if hasattr(attendance, "classroom_id") and attendance.classroom_id:
        if not db.query(Classroom).filter(Classroom.id == attendance.classroom_id).first():
            raise HTTPException(status_code=404, detail="Classroom not found")

    db_att = Attendance(
        student_id=attendance.student_id,
        class_id=getattr(attendance, "class_id", None),
        classroom_id=getattr(attendance, "classroom_id", None),
        date=attendance.date or datetime.now(),
        status=attendance.status,
        confidence_score=getattr(attendance, "confidence_score", None),
        captured_photo_url=getattr(attendance, "captured_photo_url", None),
    )

    db.add(db_att)
    db.commit()
    db.refresh(db_att)
    return db_att


# ✅ Get attendance records with flexible date filtering
def get_attendance_records(
    db: Session,
    class_id: int | None = None,
    classroom_id: int | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
):
    """Fetch attendance records with optional filters."""
    query = (
        db.query(Attendance)
        .options(
            joinedload(Attendance.student),
            joinedload(Attendance.class_obj),
            joinedload(Attendance.classroom_obj),
        )
        .order_by(Attendance.date.desc())
    )

    # 🧩 Normalize datetime → date if needed
    if isinstance(start_date, datetime):
        start_date = start_date.date()
    if isinstance(end_date, datetime):
        end_date = end_date.date()

    # ✅ Dynamic filters
    filters = []
    if class_id:
        filters.append(Attendance.class_id == class_id)
    if classroom_id:
        filters.append(Attendance.classroom_id == classroom_id)
    if start_date:
        filters.append(Attendance.date >= start_date)
    if end_date:
        filters.append(Attendance.date <= end_date)

    if filters:
        query = query.filter(and_(*filters))

    return query.all()


# ✅ Export attendance to Excel (reusing same filters)
def export_attendance_to_excel(
    db: Session,
    class_id: int | None = None,
    classroom_id: int | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
):
    """Export filtered attendance data to Excel."""
    records = get_attendance_records(
        db=db,
        class_id=class_id,
        classroom_id=classroom_id,
        start_date=start_date,
        end_date=end_date,
    )

    rows = []
    for r in records:
        student = r.student
        class_obj = getattr(r, "class_obj", None)
        classroom_obj = getattr(r, "classroom_obj", None)

        rows.append({
            "Student ID": student.id if student else "-",
            "Student Name": student.name if student else "-",
            "Class": class_obj.name if class_obj else "-",
            "Classroom": classroom_obj.name if classroom_obj else "-",
            "Date": r.date.strftime("%Y-%m-%d %H:%M") if r.date else "-",
            "Status": r.status,
            "Confidence": f"{r.confidence_score:.2f}" if r.confidence_score else "-",
            "Photo": getattr(r, "captured_photo_url", "-"),
        })

    return export_to_excel(rows, "attendance_records")
