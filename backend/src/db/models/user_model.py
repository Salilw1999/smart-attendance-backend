from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from db.db import Base   # ✅ Use db.db if your Base is declared there
from passlib.context import CryptContext

# Password encryption context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)

    # ✅ RBAC relationships
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)

    # Relationship: one role → many users
    role = relationship("Role", back_populates="users")

    # ✅ Password helpers
    def verify_password(self, password: str) -> bool:
        """Verify a plain password against the hashed password."""
        return pwd_context.verify(password, self.hashed_password)

    @staticmethod
    def get_password_hash(password: str) -> str:
        """Hash a plain password for secure storage."""
        return pwd_context.hash(password)

    def __repr__(self):
        return f"<User(username='{self.username}', role_id={self.role_id})>"
