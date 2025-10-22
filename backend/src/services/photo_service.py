from fastapi import UploadFile, File
from minio import Minio
from sqlalchemy.orm import Session
from backend.src.models.student_model import Student
from backend.src.db.db import get_db

class PhotoService:
    def __init__(self, minio_client: Minio):
        self.minio_client = minio_client

    def upload_photo(self, file: UploadFile = File(...), student_id: int = None):
        if student_id is None:
            raise ValueError("Student ID must be provided")
        
        file_location = f"student_photos/{student_id}/{file.filename}"
        self.minio_client.put_object(
            bucket_name="student-photos",
            object_name=file_location,
            data=file.file,
            length=file.file._file.tell(),
            content_type=file.content_type
        )
        return f"Photo uploaded to {file_location}"

    def get_photo_url(self, student_id: int, filename: str):
        return f"http://minio:9000/student-photos/student_photos/{student_id}/{filename}"

def create_photo_service():
    minio_client = Minio(
        "minio:9000",
        access_key="minioadmin",
        secret_key="minioadmin",
        secure=False
    )
    return PhotoService(minio_client)