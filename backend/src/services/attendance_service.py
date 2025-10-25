from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.attendance_model import Attendance
from models.student_model import Student
from schemas.attendance_schema import AttendanceCreate
from utils.excel_exporter import export_attendance_to_excel


def create_attendance_record(db: Session, attendance: AttendanceCreate):
    # Ensure student exists (optional: create student record if needed)
    student = db.query(Student).filter(Student.id == attendance.student_id).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")

    db_att = Attendance(student_id=attendance.student_id, date=attendance.date, status=attendance.status)
    db.add(db_att)
    db.commit()
    db.refresh(db_att)
    return db_att


def get_attendance_records(db: Session):
    return db.query(Attendance).all()


def export_attendance_to_excel(db: Session):
    records = db.query(Attendance).all()
    # transform ORM objects to list of dicts expected by exporter
    rows = []
    for r in records:
        rows.append({
            "student_id": r.student_id,
            "student_name": getattr(r.student, 'name', ''),
            "date": r.date,
            "status": r.status,
        })
    filepath = export_attendance_to_excel(rows, "attendance_export")
    return {"file_path": filepath}