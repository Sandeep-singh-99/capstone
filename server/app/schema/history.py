from pydantic import BaseModel
from datetime import datetime

class HealthHistoryResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
