from pydantic import BaseModel, Field, EmailStr
from typing import Optional, TypeVar, Generic
from fastapi import Form
from app.models.auth import UserRole
from datetime import datetime

# Declare a Type Variable for the dynamic data field
T = TypeVar("T")

class createUser(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    hashed_password: str = Field(..., min_length=6, max_length=30)
    role: Optional[UserRole] = Field(UserRole.PATIENT)

    @classmethod
    def as_form(
        cls, 
        full_name: str = Form(..., min_length=1, max_length=100),
        email: EmailStr = Form(...),
        hashed_password: str = Form(..., min_length=6, max_length=30),
        role: Optional[UserRole] = Form(UserRole.PATIENT)
    ):
        """Dependency to parse form data into a Pydantic model."""
        return cls(
            full_name=full_name,
            email=email,
            hashed_password=hashed_password,
            role=role
        )

class userSignIn(BaseModel):
    email: EmailStr
    password: str

    @classmethod
    def as_form(
        cls,
        email: EmailStr = Form(...),
        password: str = Form(..., min_length=6, max_length=30),
    ):
        return cls(
            email=email,
            password=password,
        )


class userResponse(BaseModel):
    id: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: str
    created_at: datetime
    updated_at: datetime
    image_url: Optional[str] = None
    image_public_id: Optional[str] = None

    class Config:
        from_attributes = True


class MessageResponse(BaseModel, Generic[T]):
    message: str
    data: Optional[T] = None