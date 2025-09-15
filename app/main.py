import json
from typing import Optional, List

from fastapi import FastAPI, Form, File, UploadFile, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import select

from .database import Base, engine, get_db
from .models import Student, Attendance, AttendanceStatus
from .schemas import StudentOut, AttendanceOut
from .storage import put_bytes, presigned_get
from .face_utils import get_face_encoding

# Create tables if not exists
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Attendance API")

# Allow CORS for frontend and devices
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Students

@app.post("/students", response_model=StudentOut)
async def create_student(
    name: str = Form(...),
    roll_no: str = Form(...),
    classroom: str = Form(...),
    family_contact: Optional[str] = Form(None),
    extra: Optional[str] = Form(None, description="JSON string for extra details"),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    # Check duplicate
    existing = db.scalar(select(Student).where(Student.roll_no == roll_no))
    if existing:
        raise HTTPException(status_code=409, detail="roll_no already exists")

    # Upload image
    data = await image.read()
    object_name, public_url = put_bytes(data, image.content_type)

    # Compute face encoding
    face_encoding = get_face_encoding(data)
    if not face_encoding:
        raise HTTPException(status_code=400, detail="No face detected in uploaded image")

    # Parse extra JSON
    extra_dict = {}
    if extra:
        try:
            extra_dict = json.loads(extra)
        except Exception:
            raise HTTPException(status_code=400, detail="extra must be valid JSON")

    student = Student(
        name=name,
        roll_no=roll_no,
        classroom=classroom,
        family_contact=family_contact,
        image_object=object_name,
        image_url_cached=public_url,
        extra=extra_dict,
        face_encoding=face_encoding,
    )
    db.add(student)
    db.commit()
    db.refresh(student)

    return StudentOut(
        id=student.id,
        name=student.name,
        roll_no=student.roll_no,
        classroom=student.classroom,
        family_contact=student.family_contact,
        image_object=student.image_object,
        image_url=student.image_url_cached or presigned_get(student.image_object),
        extra=student.extra,
        face_encoding=student.face_encoding,
    )

@app.get("/students", response_model=List[StudentOut])
def list_students(db: Session = Depends(get_db)):
    students = db.scalars(select(Student)).all()
    return [
        StudentOut(
            id=s.id,
            name=s.name,
            roll_no=s.roll_no,
            classroom=s.classroom,
            family_contact=s.family_contact,
            image_object=s.image_object,
            image_url=s.image_url_cached or presigned_get(s.image_object),
            extra=s.extra,
            face_encoding=s.face_encoding,
        )
        for s in students
    ]

@app.get("/students/{student_id}", response_model=StudentOut)
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return StudentOut(
        id=student.id,
        name=student.name,
        roll_no=student.roll_no,
        classroom=student.classroom,
        family_contact=student.family_contact,
        image_object=student.image_object,
        image_url=student.image_url_cached or presigned_get(student.image_object),  # fixed s -> student
        extra=student.extra,
        face_encoding=student.face_encoding,
    )

# Attendance

@app.post("/attendance", response_model=AttendanceOut)
async def create_attendance(
    student_id: int = Form(...),
    status: str = Form(..., description="present|absent|late"),
    source: Optional[str] = Form("manual"),
    note: Optional[str] = Form(None),
    evidence: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    student = db.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    try:
        status_enum = AttendanceStatus(status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")

    evidence_object = None
    detected_face_encoding = None
    if evidence:
        data = await evidence.read()
        evidence_object, _ = put_bytes(data, evidence.content_type)
        detected_face_encoding = get_face_encoding(data)  # may be None if no face

    att = Attendance(
        student_id=student_id,
        status=status_enum.value,
        source=source or "manual",
        note=note,
        evidence_object=evidence_object,
        face_encoding=detected_face_encoding,
    )
    db.add(att)
    db.commit()
    db.refresh(att)

    return AttendanceOut(
        id=att.id,
        student_id=att.student_id,
        at=att.at,
        status=att.status,
        source=att.source,
        note=att.note,
        evidence_object=att.evidence_object,
    )
