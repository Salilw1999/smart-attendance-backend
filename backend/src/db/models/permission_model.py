from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from db.db import Base

class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="CASCADE"))
    module = Column(String, nullable=False)

    # Access control flags
    can_view = Column(Boolean, default=False)
    can_edit = Column(Boolean, default=False)
    can_delete = Column(Boolean, default=False)

    # Relationship
    role = relationship("Role", back_populates="permissions")

    def __repr__(self):
        return f"<Permission(role_id={self.role_id}, module='{self.module}')>"
