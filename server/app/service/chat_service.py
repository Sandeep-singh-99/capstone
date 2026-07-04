import uuid
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.repositories.db_repositories import ConversationRepository, AuditLogRepository
from app.graph.graph import compiled_graph

class ChatService:
    @staticmethod
    def start_conversation(db: Session, user_id: str, report_id: Optional[str] = None, title: Optional[str] = None):
        """
        Initialize a new conversation session.
        """
        repo = ConversationRepository(db)
        convo_title = title or "New Consultation"
        convo = repo.create(user_id=user_id, report_id=report_id, title=convo_title)
        
        # Log audit trail
        audit_repo = AuditLogRepository(db)
        audit_repo.log(
            user_id=user_id,
            action="CHAT_START",
            details=f"Started conversation {convo.id}. Linked report: {report_id}"
        )
        return convo

    @staticmethod
    def continue_conversation(db: Session, user_id: str, conversation_id: str, message: str, ip_address: Optional[str] = None):
        """
        Send a follow-up query and run the multi-agent LangGraph workflow.
        """
        repo = ConversationRepository(db)
        convo = repo.get_by_id(conversation_id)
        if not convo:
            raise HTTPException(status_code=404, detail="Conversation session not found.")
        if convo.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to participate in this conversation.")
            
        print(f"Continuing conversation {conversation_id} with query: '{message[:50]}'")
        
        # Run LangGraph pipeline using conversation_id as thread_id to preserve session checkpoints
        config = {"configurable": {"thread_id": conversation_id}}
        
        initial_state = {
            "user_id": user_id,
            "conversation_id": conversation_id,
            "input_text": message,
            "file_url": None,
            "file_type": None,
            "extracted_text": None,
            "symptoms": [],
            "medical_info": None,
            "recommendations": [],
            "reminders": [],
            "messages": [],
            "response": None,
            "next_node": None
        }
        
        try:
            final_state = compiled_graph.invoke(initial_state, config=config)
            
            # Log audit trail
            audit_repo = AuditLogRepository(db)
            audit_repo.log(
                user_id=user_id,
                action="CHAT_MESSAGE",
                details=f"Sent message to session {conversation_id}",
                ip_address=ip_address
            )
            
            return {
                "response": final_state.get("response"),
                "symptoms": final_state.get("symptoms"),
                "recommendations": final_state.get("recommendations")
            }
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"LangGraph execution error during conversation: {str(e)}"
            )

    @staticmethod
    def get_conversation_history(db: Session, user_id: str, conversation_id: str):
        repo = ConversationRepository(db)
        convo = repo.get_by_id(conversation_id)
        if not convo:
            raise HTTPException(status_code=404, detail="Conversation session not found.")
        if convo.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to view this history.")
            
        messages = repo.get_messages(conversation_id)
        return {
            "conversation": convo,
            "messages": [
                {
                    "id": msg.id,
                    "question": msg.question,
                    "answer": msg.answer,
                    "created_at": msg.created_at
                }
                for msg in messages
            ]
        }

    @staticmethod
    def get_user_conversations(db: Session, user_id: str):
        repo = ConversationRepository(db)
        return repo.get_all_by_user(user_id)
        
    @staticmethod
    def delete_conversation(db: Session, user_id: str, conversation_id: str):
        repo = ConversationRepository(db)
        convo = repo.get_by_id(conversation_id)
        if not convo:
            raise HTTPException(status_code=404, detail="Conversation session not found.")
        if convo.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this conversation.")
            
        repo.delete(conversation_id)
        return {"message": "Conversation deleted successfully."}
