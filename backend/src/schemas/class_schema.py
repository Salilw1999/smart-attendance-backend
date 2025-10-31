from pydantic import BaseModel

class ClassBase(BaseModel):
    name: str

class ClassCreate(ClassBase):
    pass

class ClassResponse(ClassBase):
    id: int

    class Config:
        orm_mode = True
