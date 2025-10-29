import os
from minio import Minio
from minio.error import S3Error
from urllib.parse import urlparse

# ✅ Read values ONLY from .env (no hard-coded fallback)
MINIO_HOST = os.getenv("MINIO_HOST")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY")
MINIO_BUCKET = os.getenv("MINIO_BUCKET")
MINIO_PUBLIC_URL = os.getenv("MINIO_PUBLIC_URL")
MINIO_SECURE = os.getenv("MINIO_SECURE", "false").lower() == "true"

# ✅ Validate required configuration
missing_vars = []
if not MINIO_HOST: missing_vars.append("MINIO_HOST")
if not MINIO_ACCESS_KEY: missing_vars.append("MINIO_ACCESS_KEY")
if not MINIO_SECRET_KEY: missing_vars.append("MINIO_SECRET_KEY")
if not MINIO_BUCKET: missing_vars.append("MINIO_BUCKET")
if not MINIO_PUBLIC_URL: missing_vars.append("MINIO_PUBLIC_URL")

if missing_vars:
    raise ValueError(f"❌ Missing required MinIO env variables: {', '.join(missing_vars)}")

# ✅ Cleanup host for MinIO client
minio_host_for_client = MINIO_HOST.replace("http://", "").replace("https://", "")

# ✅ Initialize MinIO client
minio_client = Minio(
    minio_host_for_client,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=MINIO_SECURE,
)

def ensure_bucket_exists():
    """Create bucket if not exists"""
    if not minio_client.bucket_exists(MINIO_BUCKET):
        minio_client.make_bucket(MINIO_BUCKET)

def upload_file_and_get_url(file_obj, object_name: str, content_type: str):
    """Upload file + return public URL"""
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

    return f"{MINIO_PUBLIC_URL.rstrip('/')}/{MINIO_BUCKET}/{object_name}"

def remove_url_object(photo_url: str):
    """Remove object using uploaded URL"""
    if not photo_url:
        return

    parsed = urlparse(photo_url)
    path = parsed.path.lstrip('/')

    # ✅ Remove bucket prefix if exists
    if path.startswith(f"{MINIO_BUCKET}/"):
        object_name = path[len(MINIO_BUCKET) + 1 :]
    else:
        object_name = path

    try:
        minio_client.remove_object(MINIO_BUCKET, object_name)
    except Exception:
        pass
