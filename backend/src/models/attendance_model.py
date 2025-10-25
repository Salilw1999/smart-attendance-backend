from sqlalchemy import Column, Integer, ForeignKey, DateTime, String
from sqlalchemy.orm import relationship
from datetime import datetime
from db.db import Base


class Attendance(Base):
    __tablename__ = 'attendances'

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey('students.id'), nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, index=True)

    student = relationship('Student', backref='attendances')

    def __repr__(self):
        return f"<Attendance(id={self.id}, student_id={self.student_id}, status={self.status})>"
