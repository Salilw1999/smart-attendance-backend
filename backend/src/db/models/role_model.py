from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from db.db import Base

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)

    # Relationships
    users = relationship("User", back_populates="role")
    permissions = relationship("Permission", back_populates="role", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Role(name='{self.name}')>"
