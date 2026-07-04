from sqlalchemy import Boolean, Column, Enum, Integer, String, DateTime, Table, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid
from datetime import datetime

class MedicalReport(Base):
    __tablename__ = "medical_reports"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    image_url = Column(String, nullable=False)
    image_public_id = Column(String, nullable=False)
    input_text = Column(String, nullable=False)
    ai_summary = Column(String, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.utcnow())
    updated_at = Column(DateTime, default=lambda: datetime.utcnow(), onupdate=lambda: datetime.utcnow())