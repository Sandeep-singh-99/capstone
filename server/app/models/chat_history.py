from sqlalchemy import Boolean, Column, Enum, Integer, String, DateTime, Table, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid
import enum
from datetime import datetime


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    report_id = Column(String, ForeignKey("medical_reports.id"), nullable=False)
    question = Column(String, nullable=False)
    answer = Column(String, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.utcnow())
    updated_at = Column(DateTime, default=lambda: datetime.utcnow(), onupdate=lambda: datetime.utcnow())