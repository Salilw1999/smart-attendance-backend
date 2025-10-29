import os
from minio import Minio
from minio.error import S3Error
from urllib.parse import urlparse

MINIO_HOST = os.getenv("MINIO_HOST", "minio:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minioadmin")
MINIO_BUCKET = os.getenv("MINIO_BUCKET", "students")
MINIO_SECURE = os.getenv("MINIO_SECURE", "false").lower() == "true"
MINIO_PUBLIC_URL = os.getenv("MINIO_PUBLIC_URL", f"http://{MINIO_HOST}")

minio_host_for_client = MINIO_HOST.replace("http://", "").replace("https://", "")

minio_client = Minio(
    minio_host_for_client,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=MINIO_SECURE,
)

def ensure_bucket_exists():
    if not minio_client.bucket_exists(MINIO_BUCKET):
        minio_client.make_bucket(MINIO_BUCKET)

def upload_file_and_get_url(file_obj, object_name: str, content_type: str):
    ensure_bucket_exists()

    file_obj.seek(0)

    minio_client.put_object(
        MINIO_BUCKET,
        object_name,
        file_obj,
        length=-1,  # unknown size
        part_size=10 * 1024 * 1024,
        content_type=content_type,
    )

    return f"{MINIO_PUBLIC_URL.rstrip('/')}/{MINIO_BUCKET}/{object_name}"

def remove_url_object(photo_url: str):
    if not photo_url:
        return

    parsed = urlparse(photo_url)
    path = parsed.path.lstrip('/')

    if path.startswith(f"{MINIO_BUCKET}/"):
        object_name = path[len(MINIO_BUCKET) + 1 :]
    else:
        object_name = path

    try:
        minio_client.remove_object(MINIO_BUCKET, object_name)
    except Exception:
        pass
