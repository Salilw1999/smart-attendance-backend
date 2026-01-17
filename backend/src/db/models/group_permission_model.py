from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from db.db import Base


class GroupPermission(Base):
    __tablename__ = "group_permissions"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id", ondelete="CASCADE"))
    module = Column(String, nullable=False)

    # Access control flags
    can_view = Column(Boolean, default=False)
    can_edit = Column(Boolean, default=False)
    can_delete = Column(Boolean, default=False)

    # Relationship
    group = relationship("Group", back_populates="permissions")

    def __repr__(self):
        return f"<GroupPermission(group_id={self.group_id}, module='{self.module}')>"
