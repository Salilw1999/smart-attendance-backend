from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from db.db import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    unique_number = Column(String, nullable=False, unique=True)

    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    classroom_id = Column(Integer, ForeignKey("classrooms.id"), nullable=False)
    class_name = Column(String)
    classroom_name = Column(String)
    parent_contact = Column(String)
    parent_email = Column(String)
    contact_number = Column(String)
    blood_group = Column(String)
    photo_url = Column(String)
    face_embedding = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # ✅ Relationships
    class_ = relationship("Class", back_populates="students")
    classroom = relationship("Classroom", back_populates="students")
    attendances = relationship("Attendance", back_populates="student")

    def __repr__(self):
        return f"<Student(id={self.id}, name={self.name}, class_name={self.class_name}, classroom_name={self.classroom_name})>"
