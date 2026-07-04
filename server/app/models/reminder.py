from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from app.core.database import Base
import uuid
from datetime import datetime

class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    reminder_date = Column(DateTime, nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.utcnow())
    updated_at = Column(DateTime, default=lambda: datetime.utcnow(), onupdate=lambda: datetime.utcnow())
