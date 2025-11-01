from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from db.db import Base

class Classroom(Base):
    __tablename__ = "classrooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)

    # ✅ Relationships
    class_ = relationship("Class", back_populates="classrooms")
    students = relationship("Student", back_populates="classroom")

    def __repr__(self):
        return f"<Classroom(id={self.id}, name='{self.name}', class_id={self.class_id})>"
