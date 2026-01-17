from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.db import get_db
from db.models.permission_model import Permission
from db.models.user_model import User
from .session import get_current_user
from db.models.group_permission_model import GroupPermission


def require_roles(*allowed_roles: str):
    """Return a dependency which ensures the current user has one of the allowed role names.

    Usage: current_user: User = Depends(require_roles("Admin", "Editor"))
    """
    def _require(current_user: User = Depends(get_current_user)) -> User:
        # superusers bypass checks
        if getattr(current_user, "is_superuser", False):
            return current_user

        role = getattr(current_user, "role", None)
        role_name = role.name if role else None
        if role_name in allowed_roles:
            return current_user

        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role")

    return Depends(_require)


def require_permission(module: str, action: str = "view"):
    """Return a dependency which ensures the current user has the requested permission

    module: name of module as stored in the permissions table (e.g. 'students', 'attendance')
    action: one of 'view', 'edit', 'delete'
    """
    valid_actions = {"view": "can_view", "edit": "can_edit", "delete": "can_delete"}

    if action not in valid_actions:
        raise ValueError("Invalid action for permission dependency")

    def _require(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> User:
        # Superuser bypass
        if getattr(current_user, "is_superuser", False):
            return current_user

        # 1) Check role permissions (if user has a role)
        role_id = getattr(current_user, "role_id", None)
        flag_name = valid_actions[action]

        if role_id:
            perm = (
                db.query(Permission)
                .filter(Permission.role_id == role_id, Permission.module == module)
                .first()
            )
            if perm and getattr(perm, flag_name, False):
                return current_user

        # 2) Check group permissions (allow if any of user's groups grants it)
        group_ids = [g.id for g in getattr(current_user, "groups", []) if getattr(g, "id", None) is not None]
        if group_ids:
            gp = (
                db.query(GroupPermission)
                .filter(GroupPermission.group_id.in_(group_ids), GroupPermission.module == module)
                .all()
            )
            for p in gp:
                if getattr(p, flag_name, False):
                    return current_user

        # No permission found
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")

    return Depends(_require)
