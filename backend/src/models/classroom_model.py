from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from db.db import Base

class Classroom(Base):
    __tablename__ = "classrooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)

    students = relationship("Student", back_populates="classroom")

    def __repr__(self):
        return f"<Classroom(id={self.id}, name={self.name})>"
