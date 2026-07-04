from pydantic import BaseModel, Field
from typing import List, Optional

class RecommendSpecialistRequest(BaseModel):
    symptoms: List[str] = Field(..., min_items=1, description="List of symptoms reported by the patient")

class SpecialistResponse(BaseModel):
    id: str
    name: str
    description: str
    symptoms: Optional[List[str]] = None

    class Config:
        from_attributes = True

class RecommendSpecialistResponse(BaseModel):
    specialist: Optional[SpecialistResponse] = None
    recommendation_text: str
