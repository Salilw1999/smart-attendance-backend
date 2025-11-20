from sqlalchemy.orm import Session
from fastapi import HTTPException
from db.models.student_model import Student
# from models.student_model import Student
from schemas.student_schema import StudentCreate, StudentUpdate


def create_student(db: Session, student: StudentCreate):
    # check unique_number uniqueness
    existing = db.query(Student).filter(Student.unique_number == student.unique_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student with this unique number already exists")

    db_student = Student(
        name=student.name,
        unique_number=student.unique_number,
        classroom=student.classroom,
        class_name=student.class_name,
        parent_contact=student.parent_contact,
        parent_email=student.parent_email,
        contact_number=student.contact_number,
        blood_group=student.blood_group,
        photo_url=student.photo_url,
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student


def list_students(db: Session):
    return db.query(Student).all()


def get_student(db: Session, student_id: int):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


def update_student(db: Session, student_id: int, data: StudentUpdate):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    for key, value in data.dict(exclude_unset=True).items():
        setattr(student, key, value)
    db.commit()
    db.refresh(student)
    return student


def delete_student(db: Session, student_id: int):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(student)
    db.commit()
    return {"detail": "Student deleted"}
