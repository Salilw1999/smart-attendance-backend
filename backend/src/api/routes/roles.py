from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.db import get_db
from db.models.role_model import Role

router = APIRouter()

@router.get("/api/roles", tags=["Roles"])
def get_roles(db: Session = Depends(get_db)):
    """Fetch all roles"""
    return db.query(Role).all()


@router.post("/api/roles", tags=["Roles"])
def create_role(name: str, description: str | None = None, db: Session = Depends(get_db)):
    """Create a new role"""
    if db.query(Role).filter(Role.name == name).first():
        raise HTTPException(status_code=400, detail="Role already exists")

    new_role = Role(name=name, description=description)
    db.add(new_role)
    db.commit()
    db.refresh(new_role)
    return {"message": "Role created successfully", "role": new_role}
