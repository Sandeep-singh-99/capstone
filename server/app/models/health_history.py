from sqlalchemy import Boolean, Column, Enum, Integer, String, DateTime, Table, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid
import enum
from datetime import datetime


class HealthHistory(Base):
    __tablename__ = "health_history"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.utcnow())
    updated_at = Column(DateTime, default=lambda: datetime.utcnow(), onupdate=lambda: datetime.utcnow())