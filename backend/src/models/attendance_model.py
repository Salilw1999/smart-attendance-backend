from sqlalchemy import Column, Integer, ForeignKey, DateTime, String, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from db.db import Base

class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    #class_id = Column(Integer, ForeignKey("classes.id"), nullable=True)
    #classroom_id = Column(Integer, ForeignKey("classrooms.id"), nullable=True)
    class_name = Column(String,nullable=True)
    classroom_name = Column(String, nullable=True)  
    date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, index=True)
    confidence_score = Column(Float, nullable=True)
    captured_photo_url = Column(String, nullable=True)

    student = relationship("Student", back_populates="attendances")

    def __repr__(self):
        return f"<Attendance(id={self.id}, student_id={self.student_id}, status={self.status})>"
