from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.db import get_db
from models.classroom_model import Classroom

router = APIRouter(prefix="/api/classrooms", tags=["Classrooms"])

@router.get("/", response_model=list[dict])
def get_classrooms(db: Session = Depends(get_db)):
    classrooms = db.query(Classroom).order_by(Classroom.id).all()
    return [{"id": c.id, "name": c.name} for c in classrooms]

@router.post("/", response_model=dict)
def add_classroom(name: str, db: Session = Depends(get_db)):
    existing = db.query(Classroom).filter(Classroom.name == name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Classroom already exists")

    new_room = Classroom(name=name)
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return {"id": new_room.id, "name": new_room.name}
