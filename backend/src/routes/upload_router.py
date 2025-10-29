# backend/src/routes/upload_router.py
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from services.minio_service import upload_fileobj

router = APIRouter()

@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    try:
        ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        object_name = f"students/{uuid.uuid4()}.{ext}"
        file.file.seek(0)
        url = upload_fileobj(file.file, object_name, file.content_type)
        return {"photo_url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
