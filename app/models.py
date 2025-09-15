from sqlalchemy import String, DateTime, Enum, ForeignKey, JSON, func, Integer
from sqlalchemy.orm import relationship, Mapped, mapped_column
from .database import Base
import enum


class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    roll_no: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    classroom: Mapped[str] = mapped_column(String(100), nullable=False)
    family_contact: Mapped[str] = mapped_column(String(100), nullable=True)
    image_object: Mapped[str] = mapped_column(String(512), nullable=False)
    image_url_cached: Mapped[str] = mapped_column(String(1024), nullable=True)
    extra: Mapped[dict] = mapped_column(JSON, default=dict)

    # ✅ Add face encoding for master reference
    face_encoding: Mapped[list] = mapped_column(JSON, nullable=True)

    # Relationships
    attendances: Mapped[list["Attendance"]] = relationship(
        "Attendance", back_populates="student", cascade="all, delete-orphan"
    )


class AttendanceStatus(str, enum.Enum):
    present = "present"
    absent = "absent"
    late = "late"


class Attendance(Base):
    __tablename__ = "attendance"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    student_id: Mapped[int] = mapped_column(
        ForeignKey("students.id", ondelete="CASCADE"), nullable=False
    )
    at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
    status: Mapped[str] = mapped_column(Enum(AttendanceStatus), nullable=False)
    source: Mapped[str] = mapped_column(String(50), default="manual")
    note: Mapped[str] = mapped_column(String(255), nullable=True)
    evidence_object: Mapped[str] = mapped_column(String(512), nullable=True)

    # ✅ Optional encoding at the time of attendance
    face_encoding: Mapped[list] = mapped_column(JSON, nullable=True)

    # Relationships
    student: Mapped["Student"] = relationship("Student", back_populates="attendances")
