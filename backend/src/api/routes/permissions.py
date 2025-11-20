from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict

# ✅ Correct path for your project structure
from db.db import get_db
from db.models.permission_model import Permission

router = APIRouter(tags=["Permissions"])

# ✅ 1. Get permissions for a role
@router.get("/api/permissions/{role_id}", response_model=List[Dict])
def get_permissions(role_id: int, db: Session = Depends(get_db)):
    """
    Fetch all permissions associated with a given role.
    """
    perms = db.query(Permission).filter(Permission.role_id == role_id).all()

    if not perms:
        # Return empty list instead of raising error — easier for frontend
        return []

    return [
        {
            "id": p.id,
            "module": p.module,
            "can_view": p.can_view,
            "can_edit": p.can_edit,
            "can_delete": p.can_delete,
        }
        for p in perms
    ]


# ✅ 2. Update permissions for a role
@router.put("/api/permissions/{role_id}")
def update_permissions(role_id: int, updated_permissions: List[Dict], db: Session = Depends(get_db)):
    """
    Replace all permissions for a given role with a new list.

    Example JSON body:
    [
        {"module": "students", "can_view": true, "can_edit": false, "can_delete": false},
        {"module": "attendance", "can_view": true, "can_edit": true, "can_delete": false}
    ]
    """
    # Delete existing permissions for the role
    db.query(Permission).filter(Permission.role_id == role_id).delete()

    # Add new permissions
    for perm in updated_permissions:
        db_perm = Permission(
            role_id=role_id,
            module=perm.get("module"),
            can_view=perm.get("can_view", False),
            can_edit=perm.get("can_edit", False),
            can_delete=perm.get("can_delete", False),
        )
        db.add(db_perm)

    db.commit()
    return {"message": f"Permissions for role {role_id} updated successfully."}
