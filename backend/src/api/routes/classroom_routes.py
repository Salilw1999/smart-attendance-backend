from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from db.db import get_db
from models.classroom_model import Classroom

router = APIRouter(prefix="/api/classrooms", tags=["Classrooms"])


# ✅ Get classrooms (optionally filtered by class_id or show all)
@router.get("/", response_model=list[dict])
def get_classrooms(
    class_id: int | None = Query(None, description="Optional class ID filter"),
    show_all: bool = Query(True, description="Set to true to return all classrooms"),
    db: Session = Depends(get_db)
):
    """
    Retrieve classrooms.
    - If show_all=True → return all classrooms.
    - If show_all=False and class_id is provided → filter by class_id.
    """
    query = db.query(Classroom)

    if not show_all and class_id is not None:
        query = query.filter(Classroom.class_id == class_id)

    classrooms = query.order_by(Classroom.id).all()

    # Even if empty, return a blank list — no errors
    return [
        {"id": c.id, "name": c.name, "class_id": c.class_id}
        for c in classrooms
    ]


# ✅ Add a new classroom
@router.post("/", response_model=dict)
def add_classroom(
    name: str = Query(..., description="Name of the classroom"),
    class_id: int = Query(..., description="Associated class ID"),
    db: Session = Depends(get_db)
):
    """
    Add a new classroom linked to a class.
    """
    if not name.strip():
        raise HTTPException(status_code=400, detail="Classroom name cannot be empty")

    # 🔍 Check for duplicates
    existing = (
        db.query(Classroom)
        .filter(Classroom.name == name.strip(), Classroom.class_id == class_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Classroom already exists for this class")

    new_room = Classroom(name=name.strip(), class_id=class_id)
    db.add(new_room)
    db.commit()
    db.refresh(new_room)

    return {"id": new_room.id, "name": new_room.name, "class_id": new_room.class_id}
