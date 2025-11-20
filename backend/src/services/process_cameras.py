# backend/src/services/process_cameras.py
import os
import requests
import numpy as np
import face_recognition
from io import BytesIO
from db.db import SessionLocal
from services.face_matcher import load_embeddings, match_embedding
from db.models.student_model import Student
from db.models.attendance_model import Attendance
# from models.student_model import Student
# from models.attendance_model import Attendance  # create attendance model below
from datetime import datetime

CAMERA_URLS = os.getenv("CAMERA_URLS", "")  # comma-separated snapshot URLs

def fetch_image_from_url(url: str) -> BytesIO | None:
    try:
        resp = requests.get(url, timeout=10)
        if resp.status_code == 200:
            return BytesIO(resp.content)
    except Exception:
        pass
    return None

def process_one_image(file_like):
    try:
        from PIL import Image
        img = Image.open(file_like).convert("RGB")
    except Exception:
        return []
    np_img = np.array(img)
    locations = face_recognition.face_locations(np_img, model="hog")
    encodings = face_recognition.face_encodings(np_img, known_face_locations=locations)
    return encodings

def run_camera_pass():
    db = SessionLocal()
    try:
        known_ids, known_embeddings = load_embeddings(db)
        if known_embeddings.size == 0:
            return

        cameras = [u.strip() for u in CAMERA_URLS.split(",") if u.strip()]
        for cam_url in cameras:
            file_like = fetch_image_from_url(cam_url)
            if not file_like:
                continue
            encodings = process_one_image(file_like)
            for emb in encodings:
                # match
                results = match_embedding(known_embeddings, known_ids, np.array(emb, dtype=np.float32), top_k=1)
                if not results:
                    continue
                student_id, similarity = results[0]
                # check threshold
                if similarity >= 0.60:  # tweak rule
                    # create attendance record
                    att = Attendance(
                        student_id=student_id,
                        timestamp=datetime.utcnow(),
                        status="present",
                        confidence_score=float(similarity)
                    )
                    db.add(att)
            db.commit()
    finally:
        db.close()
