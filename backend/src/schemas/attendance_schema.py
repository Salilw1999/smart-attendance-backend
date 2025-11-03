from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class AttendanceBase(BaseModel):
    student_id: int
    date: datetime
    status: str
    confidence_score: Optional[float] = None
    captured_photo_url: Optional[str] = None


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceUpdate(AttendanceBase):
    id: int


class Attendance(AttendanceBase):
    id: int

    class Config:
        orm_mode = True


class AttendanceResponse(BaseModel):
    id: int
    student_id: int
    student_name: Optional[str] = None
    class_name: Optional[str] = None
    classroom_name: Optional[str] = None
    date: datetime
    status: str
    confidence_score: Optional[float] = None
    captured_photo_url: Optional[str] = None

    class Config:
        orm_mode = True


class AttendanceList(BaseModel):
    attendances: List[AttendanceResponse]
