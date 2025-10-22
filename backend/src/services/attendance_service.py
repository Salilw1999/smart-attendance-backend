from sqlalchemy.orm import Session
from fastapi import HTTPException
from .models.student_model import Student
from .schemas.attendance_schema import AttendanceCreate, AttendanceUpdate
from ..db.db import get_db

class AttendanceService:
    def __init__(self, db: Session):
        self.db = db

    def create_attendance(self, attendance: AttendanceCreate):
        db_attendance = Student(**attendance.dict())
        self.db.add(db_attendance)
        self.db.commit()
        self.db.refresh(db_attendance)
        return db_attendance

    def get_attendance(self, student_id: int):
        attendance = self.db.query(Student).filter(Student.id == student_id).first()
        if attendance is None:
            raise HTTPException(status_code=404, detail="Attendance not found")
        return attendance

    def update_attendance(self, student_id: int, attendance: AttendanceUpdate):
        db_attendance = self.db.query(Student).filter(Student.id == student_id).first()
        if db_attendance is None:
            raise HTTPException(status_code=404, detail="Attendance not found")
        for key, value in attendance.dict(exclude_unset=True).items():
            setattr(db_attendance, key, value)
        self.db.commit()
        return db_attendance

    def delete_attendance(self, student_id: int):
        db_attendance = self.db.query(Student).filter(Student.id == student_id).first()
        if db_attendance is None:
            raise HTTPException(status_code=404, detail="Attendance not found")
        self.db.delete(db_attendance)
        self.db.commit()
        return {"detail": "Attendance deleted successfully"}