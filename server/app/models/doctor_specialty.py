from sqlalchemy import Boolean, Column, Enum, Integer, String, DateTime, Table, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid
import enum
from datetime import datetime


class DoctorSpecialty(Base):
    __tablename__ = "doctor_specialties"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    doctor_id = Column(String, ForeignKey("users.id"), nullable=False)
    speciality_name = Column(String, nullable=True)
    description = Column(String, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.utcnow())
    updated_at = Column(DateTime, default=lambda: datetime.utcnow(), onupdate=lambda: datetime.utcnow())