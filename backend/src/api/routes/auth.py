from fastapi import APIRouter, Depends, HTTPException, status, Request, Form
from sqlalchemy.orm import Session
from db.db import get_db
from db.models.user_model import User
from db.models.role_model import Role
from db.models.permission_model import Permission
from core.security import (
    create_access_token,
    create_refresh_token,
    decode_access_token,
    decode_refresh_token,
)

router = APIRouter(prefix="/api/auth", tags=["Auth"])

# -----------------------------------------------------------------------------
# 🔑 LOGIN — Supports both JSON and form-data (works for curl + frontend)
# -----------------------------------------------------------------------------
@router.post("/login")
async def login(
    request: Request,
    username: str = Form(None),
    password: str = Form(None),
    db: Session = Depends(get_db),
):
    """
    Authenticate user and return JWT tokens with role + permissions
    """

    # 🧩 Handle both form and JSON input
    if not username or not password:
        try:
            body = await request.json()
            username = body.get("username")
            password = body.get("password")
        except Exception:
            raise HTTPException(status_code=400, detail="Username and password are required")

    # 🧠 Find user in database
    user = db.query(User).filter(User.username == username).first()
    if not user or not user.verify_password(password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    # 🧩 Get user role (default: viewer)
    role = db.query(Role).filter(Role.id == user.role_id).first()
    role_name = role.name if role else "Viewer"

    # 🧩 Get permissions for this role
    permissions = (
        db.query(Permission).filter(Permission.role_id == user.role_id).all()
        if user.role_id else []
    )
    permissions_dict = {
        p.module: {
            "can_view": p.can_view,
            "can_edit": p.can_edit,
            "can_delete": p.can_delete,
        }
        for p in permissions
    }

    # 🔐 Create JWT tokens (auto-expire at midnight IST)
    access_token = create_access_token({
        "sub": user.username,
        "role": role_name,
        "role_id": user.role_id,
    })
    refresh_token = create_refresh_token({"sub": user.username})

    # ✅ Return tokens + user data
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": role_name,
            "role_id": user.role_id,
            "is_active": user.is_active,
            "is_superuser": user.is_superuser,
            "permissions": permissions_dict,
        },
    }


# -----------------------------------------------------------------------------
# 🧍 REGISTER — Create a new user
# -----------------------------------------------------------------------------
@router.post("/register")
async def register_user(
    username: str = Form(...),
    password: str = Form(...),
    email: str = Form(None),
    full_name: str = Form(None),
    role_id: int = Form(None),
    db: Session = Depends(get_db),
):
    """Register a new user with an optional role"""

    if db.query(User).filter(User.username == username).first():
        raise HTTPException(status_code=400, detail="Username already exists")

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


# -----------------------------------------------------------------------------
# 🙋‍♂️ ME — Get current user info from JWT
# -----------------------------------------------------------------------------
@router.get("/me")
def get_current_user(request: Request, db: Session = Depends(get_db)):
    """Return current user details from JWT token"""

    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = auth_header.replace("Bearer ", "")
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    username = payload["sub"]
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    role = db.query(Role).filter(Role.id == user.role_id).first()
    role_name = role.name if role else "Viewer"

    permissions = (
        db.query(Permission).filter(Permission.role_id == user.role_id).all()
        if user.role_id else []
    )
    permissions_dict = {
        p.module: {
            "can_view": p.can_view,
            "can_edit": p.can_edit,
            "can_delete": p.can_delete,
        }
        for p in permissions
    }

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": role_name,
        "role_id": user.role_id,
        "is_active": user.is_active,
        "is_superuser": user.is_superuser,
        "permissions": permissions_dict,
    }
