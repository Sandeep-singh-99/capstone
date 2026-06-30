from sqlalchemy import Boolean, Column, Enum, Integer, String, DateTime, Table, ForeignKey
from sqlalchemy.orm import relationship
from app.config.database import Base
import uuid
import enum
from datetime import datetime


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    full_name = Column(String, nullable=True)
    email = Column(String, index=True, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    hashed_password = Column(String, nullable=True)

    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())
    updated_at = Column(String, default=lambda: datetime.utcnow().isoformat(), onupdate=lambda: datetime.utcnow().isoformat())

