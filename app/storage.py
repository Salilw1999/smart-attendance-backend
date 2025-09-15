import os
import uuid
import io
from minio import Minio

MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "localhost:9002")
MINIO_ROOT_USER = os.getenv("MINIO_ROOT_USER", "minioadmin")
MINIO_ROOT_PASSWORD = os.getenv("MINIO_ROOT_PASSWORD", "minioadmin")
MINIO_BUCKET = os.getenv("MINIO_BUCKET", "student-photos")
MINIO_SECURE = os.getenv("MINIO_SECURE", "false").lower() == "true"
APP_MINIO_PUBLIC_BASE = os.getenv("APP_MINIO_PUBLIC_BASE")

client = Minio(
    MINIO_ENDPOINT,
    access_key=MINIO_ROOT_USER,
    secret_key=MINIO_ROOT_PASSWORD,
    secure=MINIO_SECURE,
)


def ensure_bucket():
    if not client.bucket_exists(MINIO_BUCKET):
        client.make_bucket(MINIO_BUCKET)


def put_bytes(data: bytes, content_type: str) -> tuple[str, str | None]:
    """
    Upload bytes data to MinIO and return (object_name, public_url).
    """
    ensure_bucket()
    object_name = f"uploads/{uuid.uuid4().hex}"

    # Wrap raw bytes in a file-like object
    file_obj = io.BytesIO(data)

    client.put_object(
        MINIO_BUCKET,
        object_name,
        file_obj,
        length=len(data),
        content_type=content_type or "application/octet-stream",
    )

    public_url = None
    if APP_MINIO_PUBLIC_BASE:
        public_url = f"{APP_MINIO_PUBLIC_BASE}/{MINIO_BUCKET}/{object_name}"

    return object_name, public_url


def presigned_get(object_name: str, expires_seconds: int = 3600) -> str:
    return client.presigned_get_object(MINIO_BUCKET, object_name, expires=expires_seconds)
