from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.db import get_db
from models.class_model import Class

router = APIRouter(prefix="/api/classes", tags=["Classes"])

# Get all classes
@router.get("/", response_model=list[dict])
def get_classes(db: Session = Depends(get_db)):
    classes = db.query(Class).order_by(Class.id).all()
    return [{"id": c.id, "name": c.name} for c in classes]


# Add a new class
@router.post("/", response_model=dict)
def add_class(name: str, db: Session = Depends(get_db)):
    existing = db.query(Class).filter(Class.name == name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Class already exists")

    new_class = Class(name=name)
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    return {"id": new_class.id, "name": new_class.name}
