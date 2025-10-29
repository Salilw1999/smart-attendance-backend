# backend/src/api/routes/students.py
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from db.db import get_db
from models.student_model import Student
from schemas.student_schema import StudentResponse
from services.minio_service import upload_file_and_get_url, remove_url_object

router = APIRouter()


@router.get("/", response_model=list[StudentResponse])
def list_students(db: Session = Depends(get_db)):
    return db.query(Student).order_by(Student.id.desc()).all()


@router.post("/", response_model=StudentResponse)
async def create_student(
    name: str = Form(...),
    unique_number: str = Form(...),
    classroom: str = Form(None),
    class_name: str = Form(None),
    parent_contact: str = Form(None),
    parent_email: str = Form(None),
    contact_number: str = Form(None),
    blood_group: str = Form(None),
    photo: UploadFile = File(None),
    db: Session = Depends(get_db),
):
    exists = db.query(Student).filter(Student.unique_number == unique_number).first()
    if exists:
        raise HTTPException(status_code=400, detail="unique_number already exists")

    photo_url = None
    if photo:
        ext = photo.filename.split(".")[-1] if "." in photo.filename else "jpg"
        object_name = f"students/{uuid.uuid4()}.{ext}"
        photo.file.seek(0)
        photo_url = upload_file_and_get_url(photo.file, object_name, photo.content_type)

    new_student = Student(
        name=name,
        unique_number=unique_number,
        classroom=classroom,
        class_name=class_name,
        parent_contact=parent_contact,
        parent_email=parent_email,
        contact_number=contact_number,
        blood_group=blood_group,
        photo_url=photo_url,
        created_at=datetime.utcnow()
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
    classroom: str = Form(None),
    class_name: str = Form(None),
    parent_contact: str = Form(None),
    parent_email: str = Form(None),
    contact_number: str = Form(None),
    blood_group: str = Form(None),
    photo: UploadFile = File(None),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if unique_number and unique_number != student.unique_number:
        other = db.query(Student).filter(Student.unique_number == unique_number).first()
        if other:
            raise HTTPException(status_code=400, detail="unique_number already exists")

    if name: student.name = name
    if unique_number: student.unique_number = unique_number
    if classroom: student.classroom = classroom
    if class_name: student.class_name = class_name
    if parent_contact: student.parent_contact = parent_contact
    if parent_email: student.parent_email = parent_email
    if contact_number: student.contact_number = contact_number
    if blood_group: student.blood_group = blood_group

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
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if student.photo_url:
        try:
            remove_url_object(student.photo_url)
        except Exception:
            pass

    db.delete(student)
    db.commit()
    return {"message": "Student deleted successfully"}
