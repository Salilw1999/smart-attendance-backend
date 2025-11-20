from fastapi import UploadFile
from minio import Minio
import os
import uuid
from sqlalchemy.orm import Session
# from models.student_model import Student
from db.models.student_model import Student

def _build_minio_client():
    """Create a MinIO client based on .env variables"""
    return Minio(
        os.getenv("MINIO_HOST", "minio:9000"),
        access_key=os.getenv("MINIO_ACCESS_KEY", "minioadmin"),
        secret_key=os.getenv("MINIO_SECRET_KEY", "minioadmin"),
        secure=os.getenv("MINIO_SECURE", "false").lower() in ("1", "true", "yes"),
    )


def upload_photo(file: UploadFile, student_id: int | None = None, db: Session | None = None):
    """Upload a photo to MinIO and return its public URL"""
    if student_id is None:
        raise ValueError("student_id must be provided")

    # ✅ Ensure student exists
    if db is not None:
        student = db.query(Student).filter(Student.id == student_id).first()
        if student is None:
            raise ValueError("student not found")

    client = _build_minio_client()
    bucket = os.getenv("MINIO_BUCKET", "student-attendance")

    # ✅ Ensure bucket exists
    if not client.bucket_exists(bucket):
        client.make_bucket(bucket)

    # ✅ Generate unique and predictable file name
    ext = file.filename.split(".")[-1]
    object_name = f"students/{uuid.uuid4()}.{ext}"

    # ✅ Read file content
    file_data = file.file.read()
    client.put_object(
        bucket_name=bucket,
        object_name=object_name,
        data=file_data,
        length=len(file_data),
        content_type=file.content_type,
    )

    # ✅ Build public URL from MINIO_PUBLIC_URL (your .env)
    public_base = os.getenv("MINIO_PUBLIC_URL", "http://localhost:9000").rstrip("/")
    file_url = f"{public_base}/{bucket}/{object_name}"

    # ✅ Update DB if available
    if db is not None and student:
        student.photo_url = file_url
        db.commit()
        db.refresh(student)

    return file_url
