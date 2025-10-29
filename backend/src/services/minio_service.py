# backend/src/services/minio_service.py
import os
import io
from minio import Minio
from minio.error import S3Error

# env:
# MINIO_HOST = "minio:9000"
# MINIO_ACCESS_KEY = "minioadmin"
# MINIO_SECRET_KEY = "minioadmin"
# MINIO_BUCKET = "students"
# MINIO_SECURE = "false"
# MINIO_PUBLIC_URL = "http://localhost:9000"  # optional public URL prefix

MINIO_HOST = os.getenv("MINIO_HOST", "minio:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minioadmin")
MINIO_BUCKET = os.getenv("MINIO_BUCKET", "students")
MINIO_SECURE = os.getenv("MINIO_SECURE", "false").lower() == "true"
MINIO_PUBLIC_URL = os.getenv("MINIO_PUBLIC_URL", f"http://{MINIO_HOST}")

# Minio client requires host without schema for the client constructor
minio_host_for_client = MINIO_HOST.replace("http://", "").replace("https://", "")

minio_client = Minio(
    minio_host_for_client,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=MINIO_SECURE,
)

def ensure_bucket_exists():
    try:
        if not minio_client.bucket_exists(MINIO_BUCKET):
            minio_client.make_bucket(MINIO_BUCKET)
    except S3Error as e:
        raise RuntimeError(f"MinIO bucket check/create failed: {e}")

def upload_fileobj(file_obj, object_name: str, content_type: str):
    """
    Uploads file-like object (with .read()) to MinIO and returns public URL.
    file_obj: file-like (e.g. io.BytesIO or UploadFile.file)
    object_name: key inside bucket (e.g. "students/uuid.jpg")
    content_type: mime type
    """
    ensure_bucket_exists()
    # We can pass file_obj directly (must implement read)
    # When length unknown, set length=-1 and set part_size
    minio_client.put_object(
        MINIO_BUCKET,
        object_name,
        file_obj,
        length=-1,
        part_size=10 * 1024 * 1024,
        content_type=content_type,
    )
    # Return public URL constructed from MINIO_PUBLIC_URL
    return f"{MINIO_PUBLIC_URL.rstrip('/')}/{MINIO_BUCKET}/{object_name}"
