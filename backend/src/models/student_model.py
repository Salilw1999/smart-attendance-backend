from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Student(Base):
    __tablename__ = 'students'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    photo_url = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Student(id={self.id}, name={self.name}, photo_url={self.photo_url})>"