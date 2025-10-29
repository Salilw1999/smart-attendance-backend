import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session

from db.db import get_db
from models.student_model import Student
from schemas.student_schema import StudentResponse
from services.minio_service import upload_file_to_minio

router = APIRouter()


@router.get("/", response_model=list[StudentResponse])
def get_students(db: Session = Depends(get_db)):
    return db.query(Student).all()


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
    photo: UploadFile = File(None),  # ✅ Image upload
    db: Session = Depends(get_db),
):
    # ✅ Ensure unique student number
    existing_student = db.query(Student).filter(Student.unique_number == unique_number).first()
    if existing_student:
        raise HTTPException(status_code=400, detail="Student unique number already exists")

    # ✅ Handle image upload if provided
    photo_url = None
    if photo:
        file_extension = photo.filename.split(".")[-1]
        file_name = f"students/{uuid.uuid4()}.{file_extension}"
        upload_file_to_minio(file_name, photo.file, photo.content_type)
        photo_url = os.getenv("MINIO_URL") + file_name

    new_student = Student(
        name=name,
        unique_number=unique_number,
        classroom=classroom,
        class_name=class_name,
        parent_contact=parent_contact,
        parent_email=parent_email,
        contact_number=contact_number,
        blood_group=blood_group,
        photo_url=photo_url
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

    if name: student.name = name
    if unique_number: student.unique_number = unique_number
    if classroom: student.classroom = classroom
    if class_name: student.class_name = class_name
    if parent_contact: student.parent_contact = parent_contact
    if parent_email: student.parent_email = parent_email
    if contact_number: student.contact_number = contact_number
    if blood_group: student.blood_group = blood_group

    # ✅ Upload new photo if provided
    if photo:
        file_extension = photo.filename.split(".")[-1]
        file_name = f"students/{uuid.uuid4()}.{file_extension}"
        upload_file_to_minio(file_name, photo.file, photo.content_type)
        student.photo_url = os.getenv("MINIO_URL") + file_name

    db.commit()
    db.refresh(student)
    return student


@router.delete("/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(student)
    db.commit()
    return {"message": "Student deleted successfully"}
