from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class StudentBase(BaseModel):
    name: str
    unique_number: str
    class_name: Optional[str] = None
    classroom_name: Optional[str] = None
    parent_contact: Optional[str] = None
    parent_email: Optional[str] = None
    contact_number: Optional[str] = None
    blood_group: Optional[str] = None
    photo_url: Optional[str] = None

class StudentCreate(StudentBase):
    class_id: Optional[int] = None
    classroom_id: Optional[int] = None

class StudentResponse(StudentBase):
    id: int
    created_at: Optional[datetime] = None  

    class Config:
        orm_mode = True


