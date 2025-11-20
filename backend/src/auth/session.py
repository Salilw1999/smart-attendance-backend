from fastapi import Request, HTTPException, status, Depends
from sqlalchemy.orm import Session
from db.models.user_model import User
from db.db import get_db

class SessionAuth:
    async def __call__(self, request: Request, db: Session = Depends(get_db)):
        session_id = request.cookies.get("session")
        if not session_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated",
            )
        
        # Get user from session
        user = db.query(User).filter(User.session_id == session_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid session",
            )
        
        return user

get_current_user = SessionAuth()