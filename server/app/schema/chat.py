from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class StartChatRequest(BaseModel):
    report_id: Optional[str] = Field(None, description="Optional medical report ID to link to this consultation")
    title: Optional[str] = Field(None, description="Optional title for the consultation session")

class MessageRequest(BaseModel):
    message: str = Field(..., min_length=1, description="The message content or follow-up question")

class ConversationResponse(BaseModel):
    id: str
    user_id: str
    report_id: Optional[str] = None
    title: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ChatMessageResponse(BaseModel):
    id: str
    question: str
    answer: str
    created_at: datetime

class ConversationHistoryResponse(BaseModel):
    conversation: ConversationResponse
    messages: List[ChatMessageResponse]

class ChatQueryResponse(BaseModel):
    response: str
    symptoms: List[str]
    recommendations: List[str]
