import uuid
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from db.db import get_db
from db.models.student_model import Student
from db.models.class_model import Class
from db.models.classroom_model import Classroom
from db.models.attendance_model import Attendance
# from models.student_model import Student
# from models.class_model import Class
# from models.classroom_model import Classroom
from schemas.student_schema import StudentResponse
from services.minio_service import upload_file_and_get_url, remove_url_object

router = APIRouter()


@router.get("/", response_model=list[StudentResponse])
def list_students(db: Session = Depends(get_db)):
    """List all students with class and classroom info"""
    students = (
        db.query(Student, Class.name.label("class_name"), Classroom.name.label("classroom_name"))
        .join(Class, Student.class_id == Class.id, isouter=True)
        .join(Classroom, Student.classroom_id == Classroom.id, isouter=True)
        .order_by(Student.id.desc())
        .all()
    )

    result = []
    for student, class_name, classroom_name in students:
        s = student.__dict__
        s["class_name"] = class_name
        s["classroom_name"] = classroom_name
        result.append(s)
    return result


@router.post("/", response_model=StudentResponse)
async def create_student(
    name: str = Form(...),
    unique_number: str = Form(...),
    class_name: str = Form(None),
    classroom_name: str = Form(None),
    parent_contact: str = Form(None),
    parent_email: str = Form(None),
    contact_number: str = Form(None),
    blood_group: str = Form(None),
    photo: UploadFile = File(None),
    db: Session = Depends(get_db),
):
    """Create new student and auto-map class_id + classroom_id"""

    # Prevent duplicate unique number
    if db.query(Student).filter(Student.unique_number == unique_number).first():
        raise HTTPException(status_code=400, detail="unique_number already exists")

    # 🔹 Find class_id & classroom_id
    class_obj = db.query(Class).filter(Class.name == class_name).first() if class_name else None
    classroom_obj = db.query(Classroom).filter(Classroom.name == classroom_name).first() if classroom_name else None

    class_id = class_obj.id if class_obj else None
    classroom_id = classroom_obj.id if classroom_obj else None

    # 🔹 Handle photo upload
    photo_url = None
    if photo:
        ext = photo.filename.split(".")[-1] if "." in photo.filename else "jpg"
        object_name = f"students/{uuid.uuid4()}.{ext}"
        photo.file.seek(0)
        photo_url = upload_file_and_get_url(photo.file, object_name, photo.content_type)

    # 🔹 Create student record
    new_student = Student(
        name=name,
        unique_number=unique_number,
        class_id=class_id,
        classroom_id=classroom_id,
        class_name=class_name,
        classroom_name=classroom_name,
        parent_contact=parent_contact,
        parent_email=parent_email,
        contact_number=contact_number,
        blood_group=blood_group,
        photo_url=photo_url,
        created_at=datetime.utcnow(),
    )

    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return new_student


@router.put("/{student_id}", response_model=StudentResponse)
async def update_student(
    student_id: int,
    name: str = Form(None),
    unique_number: str = Form(None),
    class_name: str = Form(None),
    classroom_name: str = Form(None),
    parent_contact: str = Form(None),
    parent_email: str = Form(None),
    contact_number: str = Form(None),
    blood_group: str = Form(None),
    photo: UploadFile = File(None),
    db: Session = Depends(get_db),
):
    """Update student details (auto update class_id/classroom_id)"""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Validate unique_number
    if unique_number and unique_number != student.unique_number:
        if db.query(Student).filter(Student.unique_number == unique_number).first():
            raise HTTPException(status_code=400, detail="unique_number already exists")

    # Update base fields
    if name: student.name = name
    if unique_number: student.unique_number = unique_number
    if parent_contact: student.parent_contact = parent_contact
    if parent_email: student.parent_email = parent_email
    if contact_number: student.contact_number = contact_number
    if blood_group: student.blood_group = blood_group

    # 🔹 Update class + classroom mappings
    if class_name:
        class_obj = db.query(Class).filter(Class.name == class_name).first()
        student.class_id = class_obj.id if class_obj else None
        student.class_name = class_name

    if classroom_name:
        classroom_obj = db.query(Classroom).filter(Classroom.name == classroom_name).first()
        student.classroom_id = classroom_obj.id if classroom_obj else None
        student.classroom_name = classroom_name

    # 🔹 Update photo
    if photo:
        if student.photo_url:
            try:
                remove_url_object(student.photo_url)
            except Exception:
                pass

        ext = photo.filename.split(".")[-1] if "." in photo.filename else "jpg"
        object_name = f"students/{uuid.uuid4()}.{ext}"
        photo.file.seek(0)
        new_url = upload_file_and_get_url(photo.file, object_name, photo.content_type)
        student.photo_url = new_url

    db.commit()
    db.refresh(student)
    return student


@router.delete("/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    """Delete student"""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if student.photo_url:
        try:
            remove_url_object(student.photo_url)
        except Exception:
            pass
    # Delete any attendances referencing this student first to avoid
    # foreign-key NOT NULL constraint violations. We use a bulk delete
    # for efficiency and to avoid loading attendance objects into memory.
    try:
        db.query(Attendance).filter(Attendance.student_id == student_id).delete(synchronize_session=False)
    except Exception:
        # If deletion fails for some reason, raise an HTTP error so client
        # knows the student could not be removed cleanly.
        raise HTTPException(status_code=500, detail="Failed to delete related attendance records")

    db.delete(student)
    db.commit()
    return {"message": "Student deleted successfully"}
