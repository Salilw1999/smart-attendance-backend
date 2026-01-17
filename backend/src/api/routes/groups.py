from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict

from db.db import get_db
from db.models.group_model import Group
from db.models.group_permission_model import GroupPermission
from db.models.user_model import User

router = APIRouter(tags=["Groups"]) 


@router.get("/api/groups")
def get_groups(db: Session = Depends(get_db)):
    groups = db.query(Group).all()
    result = []
    for g in groups:
        result.append({
            "id": g.id,
            "name": g.name,
            "description": g.description,
            "users": [{"id": u.id, "username": u.username} for u in g.users],
        })
    return result


@router.post("/api/groups")
def create_group(name: str, description: str | None = None, db: Session = Depends(get_db)):
    if db.query(Group).filter(Group.name == name).first():
        raise HTTPException(status_code=400, detail="Group already exists")
    g = Group(name=name, description=description)
    db.add(g)
    db.commit()
    db.refresh(g)
    return {"message": "Group created", "group": g}


@router.post("/api/groups/{group_id}/users")
def add_users_to_group(group_id: int, user_ids: List[int], db: Session = Depends(get_db)):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    for uid in user_ids:
        user = db.query(User).filter(User.id == uid).first()
        if user and user not in group.users:
            group.users.append(user)

    db.commit()
    return {"message": "Users added to group"}


@router.delete("/api/groups/{group_id}/users/{user_id}")
def remove_user_from_group(group_id: int, user_id: int, db: Session = Depends(get_db)):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user in group.users:
        group.users.remove(user)
        db.commit()

    return {"message": "User removed from group"}


@router.get("/api/groups/{group_id}/permissions", response_model=List[Dict])
def get_group_permissions(group_id: int, db: Session = Depends(get_db)):
    perms = db.query(GroupPermission).filter(GroupPermission.group_id == group_id).all()
    return [
        {"id": p.id, "module": p.module, "can_view": p.can_view, "can_edit": p.can_edit, "can_delete": p.can_delete}
        for p in perms
    ]


@router.put("/api/groups/{group_id}/permissions")
def update_group_permissions(group_id: int, updated_permissions: List[Dict], db: Session = Depends(get_db)):
    db.query(GroupPermission).filter(GroupPermission.group_id == group_id).delete()
    for perm in updated_permissions:
        db_perm = GroupPermission(
            group_id=group_id,
            module=perm.get("module"),
            can_view=perm.get("can_view", False),
            can_edit=perm.get("can_edit", False),
            can_delete=perm.get("can_delete", False),
        )
        db.add(db_perm)

    db.commit()
    return {"message": f"Permissions for group {group_id} updated successfully."}
