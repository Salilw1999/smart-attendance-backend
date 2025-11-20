from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.db import get_db
from db.models.user_model import User
from db.models.role_model import Role
from pydantic import BaseModel

router = APIRouter(prefix="/api/users", tags=["Users"])

# -----------------------------------------------------------------------------
# 🧾 Pydantic Schemas
# -----------------------------------------------------------------------------
class UserCreate(BaseModel):
    username: str
    password: str
    role_id: int | None = None
    email: str | None = None


class UserUpdate(BaseModel):
    username: str | None = None
    email: str | None = None
    role_id: int | None = None


# -----------------------------------------------------------------------------
# 🧾 GET ALL USERS (JOIN ROLES)
# -----------------------------------------------------------------------------
@router.get("/")
def get_users(db: Session = Depends(get_db)):
    """Return all users with roles"""
    records = db.query(User, Role).outerjoin(Role, User.role_id == Role.id).all()

    users = []
    for user, role in records:
        users.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": role.name if role else "Viewer",
            "role_id": user.role_id,
            "is_active": user.is_active,
            "is_superuser": user.is_superuser,
        })
    return users


# -----------------------------------------------------------------------------
# 👤 GET USER BY ID
# -----------------------------------------------------------------------------
@router.get("/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    record = (
        db.query(User, Role)
        .outerjoin(Role, User.role_id == Role.id)
        .filter(User.id == user_id)
        .first()
    )

    if not record:
        raise HTTPException(status_code=404, detail="User not found")

    user, role = record
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": role.name if role else "Viewer",
        "role_id": user.role_id,
        "is_active": user.is_active,
        "is_superuser": user.is_superuser,
    }


# -----------------------------------------------------------------------------
# ➕ CREATE USER (JSON ONLY)
# -----------------------------------------------------------------------------
@router.post("/")
def create_user(data: UserCreate, db: Session = Depends(get_db)):
    """Create a new user using JSON body only"""

    # Check duplicate username
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = User.get_password_hash(data.password)

    new_user = User(
        username=data.username,
        email=data.email,
        hashed_password=hashed_password,
        role_id=data.role_id
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User created successfully", "user_id": new_user.id}


# -----------------------------------------------------------------------------
# ✏️ UPDATE USER
# -----------------------------------------------------------------------------
@router.put("/{user_id}")
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if data.username:
        user.username = data.username
    if data.email:
        user.email = data.email
    if data.role_id is not None:
        user.role_id = data.role_id

    db.commit()
    db.refresh(user)

    return {"message": "User updated successfully", "user_id": user.id}


# -----------------------------------------------------------------------------
# ❌ DELETE USER
# -----------------------------------------------------------------------------
@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()

    return {"message": f"User with ID {user_id} deleted successfully"}
