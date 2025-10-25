from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class StudentBase(BaseModel):
    name: str
    unique_number: str
    classroom: Optional[str] = None
    class_name: Optional[str] = None
    parent_contact: Optional[str] = None
    parent_email: Optional[EmailStr] = None
    contact_number: Optional[str] = None
    blood_group: Optional[str] = None
    photo_url: Optional[str] = None


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    name: Optional[str]
    unique_number: Optional[str]
    classroom: Optional[str]
    class_name: Optional[str]
    parent_contact: Optional[str]
    parent_email: Optional[EmailStr]
    contact_number: Optional[str]
    blood_group: Optional[str]
    photo_url: Optional[str]


class StudentResponse(StudentBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
