from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.auth import User
from app.dependencies.dependencies import get_current_user
from app.service.chat_service import ChatService
from app.schema.chat import (
    StartChatRequest, 
    MessageRequest, 
    ConversationResponse, 
    ChatQueryResponse, 
    ConversationHistoryResponse
)
from app.schema.auth import MessageResponse
from app.security.security import check_rate_limit
from typing import List

router = APIRouter()

@router.post("/start", response_model=MessageResponse[ConversationResponse], status_code=status.HTTP_201_CREATED)
async def start_new_conversation(
    body: StartChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Initialize a new conversation session, optionally linking it to an uploaded medical report.
    """
    convo = ChatService.start_conversation(
        db=db,
        user_id=current_user.id,
        report_id=body.report_id,
        title=body.title
    )
    return MessageResponse(
        message="Conversation session started successfully",
        data=convo
    )


@router.post("/{conversation_id}/message", response_model=MessageResponse[ChatQueryResponse], status_code=status.HTTP_200_OK, dependencies=[Depends(check_rate_limit)])
async def send_chat_message(
    conversation_id: str,
    body: MessageRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Continue a consultation session by sending a query.
    This triggers the multi-agent graph with conversational history context.
    """
    ip_address = request.client.host if request.client else None
    
    result = ChatService.continue_conversation(
        db=db,
        user_id=current_user.id,
        conversation_id=conversation_id,
        message=body.message,
        ip_address=ip_address
    )
    
    return MessageResponse(
        message="Message processed successfully",
        data=result
    )


@router.get("/{conversation_id}/history", response_model=MessageResponse[ConversationHistoryResponse], status_code=status.HTTP_200_OK)
async def get_session_history(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve all questions and AI answers for a specific conversation session.
    """
    result = ChatService.get_conversation_history(db, current_user.id, conversation_id)
    return MessageResponse(message="Conversation history retrieved", data=result)


@router.get("/", response_model=MessageResponse[List[ConversationResponse]], status_code=status.HTTP_200_OK)
async def get_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve all conversation sessions for the authenticated user.
    """
    convos = ChatService.get_user_conversations(db, current_user.id)
    return MessageResponse(message="Conversations list retrieved", data=convos)


@router.delete("/{conversation_id}", status_code=status.HTTP_200_OK)
async def delete_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a conversation session and all its message records.
    """
    result = ChatService.delete_conversation(db, current_user.id, conversation_id)
    return MessageResponse(message=result["message"])
