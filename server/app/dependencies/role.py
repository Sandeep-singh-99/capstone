from fastapi import Depends, HTTPException
from app.models.auth import User
from app.dependencies.dependencies import get_current_user

async def get_current_active_user(role: str):
    """Dependency to get the current authenticated user and check their role."""
    user: User = await get_current_user()
    if user.role != role:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return user