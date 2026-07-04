from sqlalchemy import Column, String, DateTime, JSON
from app.core.database import Base
import uuid
from datetime import datetime

class Specialist(Base):
    __tablename__ = "specialists"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, index=True, nullable=False) # e.g., "Cardiologist"
    description = Column(String, nullable=False)
    symptoms = Column(JSON, nullable=True) # JSON list of symptoms, e.g. ["chest pain", "shortness of breath"]

    created_at = Column(DateTime, default=lambda: datetime.utcnow())
    updated_at = Column(DateTime, default=lambda: datetime.utcnow(), onupdate=lambda: datetime.utcnow())
