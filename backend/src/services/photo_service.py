from fastapi import UploadFile
from minio import Minio
import os
from sqlalchemy.orm import Session
from models.student_model import Student


def _build_minio_client():
    return Minio(
        os.getenv("MINIO_ENDPOINT", "minio:9000"),
        access_key=os.getenv("MINIO_ACCESS_KEY", "minioadmin"),
        secret_key=os.getenv("MINIO_SECRET_KEY", "minioadmin"),
        secure=os.getenv("MINIO_SECURE", "false").lower() in ("1", "true", "yes"),
    )


def upload_photo(file: UploadFile, student_id: int | None = None, db: Session | None = None):
    if student_id is None:
        raise ValueError("student_id must be provided")

    # Optionally validate student exists
    if db is not None:
        student = db.query(Student).filter(Student.id == student_id).first()
        if student is None:
            raise ValueError("student not found")

    client = _build_minio_client()
    bucket = os.getenv("MINIO_BUCKET", "student-photos")

    # ensure bucket exists
    try:
        if not client.bucket_exists(bucket):
            client.make_bucket(bucket)
    except Exception:
        pass

    # Read file content to determine length
    content = file.file.read()
    object_name = f"student_photos/{student_id}/{file.filename}"
    client.put_object(bucket, object_name, data=content, length=len(content), content_type=file.content_type)

    # Return a URL (assumes MinIO is served at MINIO_ENDPOINT)
    endpoint = os.getenv("MINIO_ENDPOINT", "minio:9000")
    proto = "https" if os.getenv("MINIO_SECURE", "false").lower() in ("1", "true", "yes") else "http"
    return f"{proto}://{endpoint}/{bucket}/{object_name}"