from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class CreateReminderRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=100, description="Title of the reminder (e.g. Cardiologist appointment)")
    description: Optional[str] = Field(None, max_length=500, description="Additional context or details")
    reminder_date: datetime = Field(..., description="Target date and time for the reminder")

class ReminderResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    reminder_date: datetime
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
