from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from datetime import datetime
from models.attendance_model import Attendance
from models.student_model import Student
from schemas.attendance_schema import AttendanceCreate
from utils.excel_exporter import export_attendance_to_excel as export_to_excel


def create_attendance_record(db: Session, attendance: AttendanceCreate):
    """
    Create a new attendance record for a student.
    """
    student = db.query(Student).filter(Student.id == attendance.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    db_att = Attendance(
        student_id=attendance.student_id,
        class_name=attendance.class_name,
        classroom_name=attendance.classroom_name,
        date=attendance.date,
        status=attendance.status,
        confidence_score=attendance.confidence_score,
        captured_photo_url=attendance.captured_photo_url
    )

    db.add(db_att)
    db.commit()
    db.refresh(db_att)
    return db_att


def get_attendance_records(
    db: Session,
    class_name: str | None = None,
    classroom_name: str | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
):
    """
    Fetch attendance records with optional filters.
    """
    query = db.query(Attendance).options(joinedload(Attendance.student)).order_by(Attendance.date.desc())

    if class_name:
        query = query.filter(Attendance.class_name == class_name)
    if classroom_name:
        query = query.filter(Attendance.classroom_name == classroom_name)
    if start_date and end_date:
        query = query.filter(Attendance.date.between(start_date, end_date))

    return query.all()


def export_attendance_to_excel(
    db: Session,
    class_name: str | None = None,
    classroom_name: str | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
):
    """
    Export filtered attendance data to Excel.
    """
    records = get_attendance_records(
        db=db,
        class_name=class_name,
        classroom_name=classroom_name,
        start_date=start_date,
        end_date=end_date,
    )

    rows = []
    for r in records:
        student = r.student
        rows.append({
            "Student ID": student.id if student else "-",
            "Student Name": student.name if student else "-",
            "Class Name": r.class_name or "-",
            "Classroom Name": r.classroom_name or "-",
            "Date": r.date.strftime("%Y-%m-%d %H:%M"),
            "Status": r.status,
            "Confidence Score": r.confidence_score or "-",
        })

    file_path = export_to_excel(rows, "attendance_records")
    return {"file_path": file_path}
