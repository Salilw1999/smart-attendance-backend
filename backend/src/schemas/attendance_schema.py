from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class AttendanceBase(BaseModel):
    student_id: int
    date: datetime
    status: str  # e.g., "present", "absent", "late"

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(AttendanceBase):
    id: int

class Attendance(AttendanceBase):
    id: int

    class Config:
        orm_mode = True

class AttendanceList(BaseModel):
    attendances: List[Attendance]