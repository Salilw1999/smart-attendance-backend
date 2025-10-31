from pydantic import BaseModel

class ClassroomBase(BaseModel):
    name: str

class ClassroomCreate(ClassroomBase):
    pass

class ClassroomResponse(ClassroomBase):
    id: int

    class Config:
        orm_mode = True
