from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

# ✅ FIXED imports
from db.db import get_db
from db.models.user_model import User
from db.models.role_model import Role
from db.models.permission_model import Permission
from core.security import create_access_token, decode_access_token

router = APIRouter(prefix="/api/auth", tags=["Auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# ✅ LOGIN — returns JWT + role + permissions
@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Authenticate user and return JWT token with role-based permissions"""
    user = db.query(User).filter(User.username == form_data.username).first()

    if not user or not user.verify_password(form_data.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # Fetch role
    role = db.query(Role).filter(Role.id == user.role_id).first()
    role_name = role.name if role else "viewer"

    # Fetch permissions
    permissions = (
        db.query(Permission)
        .filter(Permission.role_id == user.role_id)
        .all()
        if user.role_id
        else []
    )
    permissions_dict = {
        p.module: {"can_view": p.can_view, "can_edit": p.can_edit, "can_delete": p.can_delete}
        for p in permissions
    }

    # Generate token
    access_token_expires = timedelta(minutes=60)
    access_token = create_access_token(
        data={"sub": user.username, "role": role_name},
        expires_delta=access_token_expires,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": role_name,
            "is_superuser": user.is_superuser,
            "permissions": permissions_dict,
        },
    }


# ✅ REGISTER — add new user
@router.post("/register")
def register_user(
    username: str,
    password: str,
    email: str | None = None,
    full_name: str | None = None,
    role_id: int | None = None,
    db: Session = Depends(get_db),
):
    """Register a new user with an optional role"""
    if db.query(User).filter(User.username == username).first():
        raise HTTPException(status_code=400, detail="Username already registered")

    hashed_pw = User.get_password_hash(password)
    new_user = User(
        username=username,
        email=email,
        full_name=full_name,
        hashed_password=hashed_pw,
        role_id=role_id,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "✅ User registered successfully", "user_id": new_user.id}


# ✅ GET CURRENT USER (with permissions)
@router.get("/me")
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Return current user's info, including role and permissions"""
    payload = decode_access_token(token)
    username = payload.get("sub")
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    role = db.query(Role).filter(Role.id == user.role_id).first()
    role_name = role.name if role else "viewer"

    permissions = (
        db.query(Permission)
        .filter(Permission.role_id == user.role_id)
        .all()
        if user.role_id
        else []
    )
    permissions_dict = {
        p.module: {"can_view": p.can_view, "can_edit": p.can_edit, "can_delete": p.can_delete}
        for p in permissions
    }

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": role_name,
        "is_active": user.is_active,
        "is_superuser": user.is_superuser,
        "permissions": permissions_dict,
    }
