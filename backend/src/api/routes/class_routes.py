from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from db.db import get_db
#from models.class_model import Class
from db.models.class_model import Class
router = APIRouter(prefix="/api/classes", tags=["Classes"])


# ✅ Get all classes
@router.get("/", response_model=list[dict])
def get_classes(db: Session = Depends(get_db)):
    """
    Retrieve all available classes.
    Returns: List of { id, name }
    """
    classes = db.query(Class).order_by(Class.id).all()
    return [{"id": c.id, "name": c.name} for c in classes]


# ✅ Add a new class
@router.post("/", response_model=dict)
def add_class(
    name: str = Query(..., description="Name of the class"),
    db: Session = Depends(get_db)
):
    """
    Add a new class if it does not already exist.
    """
    clean_name = name.strip()

    if not clean_name:
        raise HTTPException(status_code=400, detail="Class name cannot be empty")

    # 🔍 Case-insensitive duplicate check
    existing = db.query(Class).filter(Class.name.ilike(clean_name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Class already exists")

    # ✅ Create new class record
    new_class = Class(name=clean_name)
    db.add(new_class)
    db.commit()
    db.refresh(new_class)

    return {"id": new_class.id, "name": new_class.name}
