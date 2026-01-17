from sqlalchemy import Column, Integer, String, Table, ForeignKey
from sqlalchemy.orm import relationship
from db.db import Base

# Association table for many-to-many between users and groups
user_groups = Table(
    "user_groups",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE")),
    Column("group_id", Integer, ForeignKey("groups.id", ondelete="CASCADE")),
)


class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)

    # Relationships
    users = relationship("User", secondary=user_groups, back_populates="groups")
    permissions = relationship(
        "GroupPermission", back_populates="group", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Group(name='{self.name}')>"
