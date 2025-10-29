from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.db import get_db
from models.student_model import Student
from schemas.student_schema import StudentCreate, StudentResponse

router = APIRouter()

@router.post("/api/students", response_model=StudentResponse)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    new_student = Student(**student.dict())

    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    return new_student
