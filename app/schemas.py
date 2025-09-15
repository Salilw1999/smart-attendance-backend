from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime

class StudentCreate(BaseModel):
    name: str
    roll_no: str
    classroom: str
    family_contact: Optional[str] = None
    extra: Optional[dict[str, Any]] = Field(default_factory=dict)

class StudentOut(BaseModel):
    id: int
    name: str
    roll_no: str
    classroom: str
    family_contact: Optional[str]
    image_url: Optional[str] = None
    image_object: str
    extra: dict

    class Config:
        from_attributes = True

class AttendanceCreate(BaseModel):
    student_id: int
    status: str
    source: Optional[str] = "manual"
    note: Optional[str] = None

class AttendanceOut(BaseModel):
    id: int
    student_id: int
    at: datetime
    status: str
    source: str
    note: Optional[str]
    evidence_object: Optional[str]

    class Config:
        from_attributes = True
