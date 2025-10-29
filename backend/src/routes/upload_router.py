import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from services.minio_service import upload_file_and_get_url

router = APIRouter()

@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    try:
        ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        object_name = f"students/{uuid.uuid4()}.{ext}"

        file.file.seek(0)
        url = upload_file_and_get_url(file.file, object_name, file.content_type)

        return {"photo_url": url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MinIO Upload Failed: {str(e)}")
