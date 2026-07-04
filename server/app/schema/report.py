from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class MedicalReportResponse(BaseModel):
    id: str
    user_id: str
    file_url: Optional[str] = None
    file_public_id: Optional[str] = None
    file_type: Optional[str] = None
    image_url: Optional[str] = None
    image_public_id: Optional[str] = None
    input_text: Optional[str] = None
    extracted_text: Optional[str] = None
    ai_summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ReportUploadResponse(BaseModel):
    report: Optional[MedicalReportResponse] = None
    analysis: Optional[str] = None
    extracted_text: Optional[str] = None
    symptoms: List[str]
    recommendations: List[str]
