from pydantic import BaseModel, Field
from typing import Optional
from fastapi import Form
from app.models.auth import UserRole

class createUser(BaseModel):
    full_name: str = Form(..., min_length=1, max_length=100),
    email: str = Form(..., min_length=1, max_length=100),
    hashed_password: str = Form(..., min_length=6, max_length=30),
    role: Optional[UserRole] = Form(UserRole.USER)

class userSignIn(BaseModel):
    email: str = Form(..., min_length=1, max_length=100),
    hashed_password: str = Form(..., min_length=6, max_length=30)

class userResponse(BaseModel):
    id: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: str
    created_at: str
    updated_at: str
    image_url: Optional[str] = None
    image_public_id: Optional[str] = None

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    message: str