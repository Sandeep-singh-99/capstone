from pydantic import BaseModel, Field
from typing import Optional
from fastapi import Form

class createUser(BaseModel):
    full_name: str = Form(..., min_length=1, max_length=100),
    email: str = Form(..., min_length=1, max_length=100),
    hashed_password: str = Form(..., min_length=6, max_length=30)

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

    class Config:
        from_attributes = True