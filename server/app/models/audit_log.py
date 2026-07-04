from sqlalchemy import Column, String, DateTime, ForeignKey
from app.core.database import Base
import uuid
from datetime import datetime

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=True) # Can be NULL for unauthenticated requests
    action = Column(String, nullable=False) # e.g., "LOGIN", "REPORT_UPLOAD", "AGENT_EXECUTION"
    details = Column(String, nullable=True) # Extra info (JSON encoded string or plain text)
    ip_address = Column(String, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.utcnow())
