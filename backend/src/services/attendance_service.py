from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from datetime import datetime
from models.attendance_model import Attendance
from models.student_model import Student
from models.class_model import Class
from models.classroom_model import Classroom
from schemas.attendance_schema import AttendanceCreate
from utils.excel_exporter import export_attendance_to_excel as export_to_excel


def create_attendance_record(db: Session, attendance: AttendanceCreate):
    """
    Create a new attendance record for a student.
    """
    # ✅ Validate student existence
    student = db.query(Student).filter(Student.id == attendance.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # ✅ Optional class & classroom validation
    if attendance.class_id:
        class_exists = db.query(Class).filter(Class.id == attendance.class_id).first()
        if not class_exists:
            raise HTTPException(status_code=404, detail="Class not found")

    if attendance.classroom_id:
        classroom_exists = db.query(Classroom).filter(Classroom.id == attendance.classroom_id).first()
        if not classroom_exists:
            raise HTTPException(status_code=404, detail="Classroom not found")

    # ✅ Create attendance record
    db_att = Attendance(
        student_id=attendance.student_id,
        class_id=attendance.class_id,
        classroom_id=attendance.classroom_id,
        date=attendance.date or datetime.now(),
        status=attendance.status,
        verification_method=getattr(attendance, "verification_method", "manual"),
    )

    db.add(db_att)
    db.commit()
    db.refresh(db_att)
    return db_att


def get_attendance_records(
    db: Session,
    class_id: int | None = None,
    classroom_id: int | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
):
    """
    Fetch attendance records with optional filters.
    """
    query = (
        db.query(Attendance)
        .options(
            joinedload(Attendance.student),
            joinedload(Attendance.class_obj),
            joinedload(Attendance.classroom_obj),
        )
        .order_by(Attendance.date.desc())
    )

    if class_id:
        query = query.filter(Attendance.class_id == class_id)
    if classroom_id:
        query = query.filter(Attendance.classroom_id == classroom_id)
    if start_date and end_date:
        query = query.filter(Attendance.date.between(start_date, end_date))

    return query.all()


def export_attendance_to_excel(
    db: Session,
    class_id: int | None = None,
    classroom_id: int | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
):
    """
    Export filtered attendance data to Excel (used by API).
    """
    records = get_attendance_records(
        db=db,
        class_id=class_id,
        classroom_id=classroom_id,
        start_date=start_date,
        end_date=end_date,
    )

    # ✅ Prepare rows for export
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
            "Date": r.date.strftime("%Y-%m-%d %H:%M"),
            "Status": r.status,
            "Verification Method": getattr(r, "verification_method", "Manual"),
        })

    # ✅ Export to Excel and return file path
    file_path = export_to_excel(rows, "attendance_records")
    return file_path
