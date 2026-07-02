from sqlalchemy import Boolean, Column, Enum, Integer, String, DateTime, Table, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid
import enum
from datetime import datetime


class UserRole(str, enum.Enum):
    DOCTOR = "doctor"
    USER = "user"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    full_name = Column(String, nullable=True)
    email = Column(String, index=True, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=True)
    image_url = Column(String, nullable=True)
    image_public_id = Column(String, nullable=True)
    hashed_password = Column(String, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.utcnow())
    updated_at = Column(DateTime, default=lambda: datetime.utcnow(), onupdate=lambda: datetime.utcnow())
