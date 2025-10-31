from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from db.db import Base

class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)

    students = relationship("Student", back_populates="class_")

    def __repr__(self):
        return f"<Class(id={self.id}, name={self.name})>"
