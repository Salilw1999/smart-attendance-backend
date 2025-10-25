from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from db.db import Base


class Student(Base):
    __tablename__ = 'students'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    unique_number = Column(String, unique=True, index=True, nullable=False)
    classroom = Column(String, index=True, nullable=True)
    class_name = Column(String, index=True, nullable=True)
    parent_contact = Column(String, nullable=True)
    parent_email = Column(String, nullable=True)
    contact_number = Column(String, nullable=True)
    blood_group = Column(String, nullable=True)
    photo_url = Column(String, index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Student(id={self.id}, name={self.name}, photo_url={self.photo_url})>"