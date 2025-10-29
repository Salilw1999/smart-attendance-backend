import os
from minio import Minio
from minio.error import S3Error
from urllib.parse import urlparse

# ✅ ENVIRONMENT VARIABLES
MINIO_HOST = os.getenv("MINIO_HOST", "minio:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minioadmin")
MINIO_BUCKET = os.getenv("MINIO_BUCKET", "students")
MINIO_SECURE = os.getenv("MINIO_SECURE", "false").lower() == "true"
MINIO_PUBLIC_URL = os.getenv("MINIO_PUBLIC_URL")

if not MINIO_PUBLIC_URL:
    MINIO_PUBLIC_URL = f"http://{MINIO_HOST}"

# ✅ Remove http:// from host for Minio client:
minio_host_for_client = MINIO_HOST.replace("http://", "").replace("https://", "")

# ✅ Create Client
minio_client = Minio(
    minio_host_for_client,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=MINIO_SECURE,
)

def ensure_bucket_exists():
    """ Ensure bucket exists before uploading """
    try:
        if not minio_client.bucket_exists(MINIO_BUCKET):
            minio_client.make_bucket(MINIO_BUCKET)
    except S3Error as e:
        raise RuntimeError(f"MinIO bucket error: {e}")

def upload_file_and_get_url(file_obj, object_name: str, content_type: str):
    """ Upload file and return public accessible URL """
    ensure_bucket_exists()
    file_obj.seek(0)

    minio_client.put_object(
        MINIO_BUCKET,
        object_name,
        file_obj,
        length=-1,
        part_size=10 * 1024 * 1024,
        content_type=content_type,
    )

    # ✅ Public URL for frontend usage
    return f"{MINIO_PUBLIC_URL.rstrip('/')}/{MINIO_BUCKET}/{object_name}"

def remove_url_object(photo_url: str):
    """ Delete object from MinIO using full URL """
    if not photo_url:
        return

    try:
        parsed = urlparse(photo_url)
        object_path = parsed.path.lstrip('/')
        # ✅ Remove bucket prefix
        if object_path.startswith(f"{MINIO_BUCKET}/"):
            object_name = object_path[len(MINIO_BUCKET) + 1:]
        else:
            object_name = object_path

        minio_client.remove_object(MINIO_BUCKET, object_name)
    except Exception:
        pass
