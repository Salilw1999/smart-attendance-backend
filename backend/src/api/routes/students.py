from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.db import get_db
from services.student_service import (
    create_student,
    list_students,
    get_student,
    update_student,
    delete_student,
)
from schemas.student_schema import StudentCreate, StudentResponse, StudentUpdate

router = APIRouter()


@router.post("/", response_model=StudentResponse)
def create(student: StudentCreate, db: Session = Depends(get_db)):
    return create_student(db=db, student=student)


@router.get("/", response_model=list[StudentResponse])
def list_all(db: Session = Depends(get_db)):
    return list_students(db=db)


@router.get("/{student_id}", response_model=StudentResponse)
def read(student_id: int, db: Session = Depends(get_db)):
    return get_student(db=db, student_id=student_id)


@router.put("/{student_id}", response_model=StudentResponse)
def update(student_id: int, data: StudentUpdate, db: Session = Depends(get_db)):
    return update_student(db=db, student_id=student_id, data=data)


@router.delete("/{student_id}")
def remove(student_id: int, db: Session = Depends(get_db)):
    return delete_student(db=db, student_id=student_id)
