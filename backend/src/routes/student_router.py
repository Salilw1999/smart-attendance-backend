from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from db.db import get_db
from models.student_model import Student
from datetime import datetime
import os
import shutil

router = APIRouter(prefix="/api/students", tags=["Students"])

UPLOAD_DIR = "uploads/students"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Create student (supports multipart form)
@router.post("/", response_model=dict)
def create_student(
    name: str = Form(...),
    unique_number: str = Form(...),
    class_name: str = Form(None),
    classroom_name: str = Form(None),
    parent_contact: str = Form(None),
    parent_email: str = Form(None),
    contact_number: str = Form(None),
    blood_group: str = Form(None),
    photo: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    # Check if unique_number already exists
    existing = db.query(Student).filter(Student.unique_number == unique_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Unique number already exists")

    # Save photo if provided
    photo_url = None
    if photo:
        filename = f"{unique_number}_{photo.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        photo_url = f"/{file_path}"

    # Create new student
    new_student = Student(
        name=name,
        unique_number=unique_number,
        class_name=class_name,
        classroom=classroom_name,
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

    return {
        "id": new_student.id,
        "name": new_student.name,
        "unique_number": new_student.unique_number,
        "class_name": new_student.class_name,
        "classroom_name": new_student.classroom,
        "parent_contact": new_student.parent_contact,
        "parent_email": new_student.parent_email,
        "contact_number": new_student.contact_number,
        "blood_group": new_student.blood_group,
        "photo_url": new_student.photo_url,
    }


# Update student
@router.put("/{student_id}", response_model=dict)
def update_student(
    student_id: int,
    name: str = Form(...),
    unique_number: str = Form(...),
    class_name: str = Form(None),
    classroom_name: str = Form(None),
    parent_contact: str = Form(None),
    parent_email: str = Form(None),
    contact_number: str = Form(None),
    blood_group: str = Form(None),
    photo: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Update photo if provided
    if photo:
        filename = f"{unique_number}_{photo.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        student.photo_url = f"/{file_path}"

    student.name = name
    student.unique_number = unique_number
    student.class_name = class_name
    student.classroom = classroom_name
    student.parent_contact = parent_contact
    student.parent_email = parent_email
    student.contact_number = contact_number
    student.blood_group = blood_group

    db.commit()
    db.refresh(student)

    return {
        "id": student.id,
        "name": student.name,
        "unique_number": student.unique_number,
        "class_name": student.class_name,
        "classroom_name": student.classroom,
        "parent_contact": student.parent_contact,
        "parent_email": student.parent_email,
        "contact_number": student.contact_number,
        "blood_group": student.blood_group,
        "photo_url": student.photo_url,
    }
