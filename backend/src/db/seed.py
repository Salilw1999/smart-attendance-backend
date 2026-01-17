from sqlalchemy import func
from db.db import SessionLocal
from db.models.role_model import Role
from db.models.permission_model import Permission
from db.models.user_model import User


def seed_default_data():
    """
    Create default roles, permissions and admin user.
    Safe to run multiple times (idempotent).
    """
    db = SessionLocal()

    try:
        # --------------------------------------------------
        # Helper: get or create role (CASE-INSENSITIVE)
        # --------------------------------------------------
        def get_or_create_role(name: str, description: str):
            key = name.lower().strip()

            role = (
                db.query(Role)
                .filter(func.lower(Role.name) == key)
                .first()
            )

            if not role:
                role = Role(name=key, description=description)
                db.add(role)
                db.commit()
                db.refresh(role)

            return role

        # --------------------------------------------------
        # Roles
        # --------------------------------------------------
        admin_role = get_or_create_role("admin", "Full access")
        editor_role = get_or_create_role("editor", "Edit access")
        viewer_role = get_or_create_role("viewer", "Read-only")

        # --------------------------------------------------
        # Permissions
        # --------------------------------------------------
        modules = ["students", "attendance"]

        def permission_exists(role_id, module):
            return (
                db.query(Permission)
                .filter(
                    Permission.role_id == role_id,
                    Permission.module == module
                )
                .first()
                is not None
            )

        for module in modules:
            # Admin permissions
            if not permission_exists(admin_role.id, module):
                db.add(Permission(
                    role_id=admin_role.id,
                    module=module,
                    can_view=True,
                    can_edit=True,
                    can_delete=True
                ))

            # Editor permissions
            if not permission_exists(editor_role.id, module):
                db.add(Permission(
                    role_id=editor_role.id,
                    module=module,
                    can_view=True,
                    can_edit=True,
                    can_delete=False
                ))

            # Viewer permissions
            if not permission_exists(viewer_role.id, module):
                db.add(Permission(
                    role_id=viewer_role.id,
                    module=module,
                    can_view=True,
                    can_edit=False,
                    can_delete=False
                ))

        db.commit()

        # --------------------------------------------------
        # Default admin user
        # --------------------------------------------------
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            hashed_password = User.get_password_hash("admin")

            admin_user = User(
                username="admin",
                hashed_password=hashed_password,
                role_id=admin_role.id,
                is_superuser=True
            )

            db.add(admin_user)
            db.commit()

    finally:
        db.close()
