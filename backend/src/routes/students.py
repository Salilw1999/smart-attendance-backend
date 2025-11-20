import os
import uuid
import numpy as np
import face_recognition
from io import BytesIO
from PIL import Image, UnidentifiedImageError
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status, Query
from sqlalchemy.orm import Session
from db.db import get_db
from db.models.student_model import Student
from db.models.class_model import Class
from db.models.classroom_model import Classroom
# from models.student_model import Student
# from models.class_model import Class
# from models.classroom_model import Classroom
from schemas.student_schema import StudentResponse
from services.minio_service import upload_file_to_minio, remove_url_object

router = APIRouter(prefix="/api/students", tags=["Students"])

# ✅ Fetch all or filtered students
@router.get("/", response_model=list[StudentResponse])
def get_students(
    class_id: int = Query(None),
    classroom_id: int = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Student)
    if class_id:
        query = query.filter(Student.class_id == class_id)
    if classroom_id:
        query = query.filter(Student.classroom_id == classroom_id)
    return query.all()


# ✅ Create new student
@router.post("/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def create_student(
    name: str = Form(...),
    unique_number: str = Form(...),
    class_id: int = Form(None),
    classroom_id: int = Form(None),
    parent_contact: str = Form(None),
    parent_email: str = Form(None),
    contact_number: str = Form(None),
    blood_group: str = Form(None),
    photo: UploadFile = File(None),
    db: Session = Depends(get_db),
):
    existing = db.query(Student).filter(Student.unique_number == unique_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student unique number already exists")

    # ✅ Get class & classroom names
    db_class = db.query(Class).filter(Class.id == class_id).first() if class_id else None
    db_room = db.query(Classroom).filter(Classroom.id == classroom_id).first() if classroom_id else None

    photo_url = None
    face_embedding = None

    # ✅ Handle photo upload (optional)
    if photo:
        try:
            file_ext = photo.filename.split(".")[-1]
            file_name = f"students/{uuid.uuid4()}.{file_ext}"
            upload_file_to_minio(file_name, photo.file, photo.content_type)

            base_url = os.getenv("MINIO_URL", "")
            photo_url = f"{base_url}{file_name}"

            photo.file.seek(0)
            face_embedding = compute_face_embedding_from_fileobj(photo.file)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Photo upload or face recognition failed: {e}")

    try:
        student = Student(
            name=name,
            unique_number=unique_number,
            class_id=class_id,
            classroom_id=classroom_id,
            class_name=db_class.name if db_class else None,
            classroom_name=db_room.name if db_room else None,
            parent_contact=parent_contact,
            parent_email=parent_email,
            contact_number=contact_number,
            blood_group=blood_group,
            photo_url=photo_url,
            face_embedding=face_embedding,
        )
        db.add(student)
        db.commit()
        db.refresh(student)
        return student
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")


def compute_face_embedding_from_fileobj(file_obj) -> list | None:
    """Extract face embeddings"""
    try:
        file_obj.seek(0)
        img = Image.open(BytesIO(file_obj.read())).convert("RGB")
        np_img = np.array(img)
        face_locations = face_recognition.face_locations(np_img, model="hog")
        if not face_locations:
            return None
        encodings = face_recognition.face_encodings(np_img, known_face_locations=face_locations)
        return encodings[0].tolist() if encodings else None
    except UnidentifiedImageError:
        return None
    except Exception:
        return None
