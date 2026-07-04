from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.models.medical_report import MedicalReport
from app.models.health_history import HealthHistory
from app.models.conversation import Conversation
from app.models.chat_history import ChatHistory
from app.models.specialist import Specialist
from app.models.reminder import Reminder
from app.models.audit_log import AuditLog

class MedicalReportRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: str, file_url: str, file_public_id: str, file_type: str, 
               input_text: Optional[str] = None, extracted_text: Optional[str] = None, 
               ai_summary: Optional[str] = None) -> MedicalReport:
        report = MedicalReport(
            user_id=user_id,
            file_url=file_url,
            file_public_id=file_public_id,
            file_type=file_type,
            image_url=file_url if file_type == "image" else None,
            image_public_id=file_public_id if file_type == "image" else None,
            input_text=input_text or "",
            extracted_text=extracted_text or "",
            ai_summary=ai_summary or ""
        )
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    def get_by_id(self, report_id: str) -> Optional[MedicalReport]:
        return self.db.query(MedicalReport).filter(MedicalReport.id == report_id).first()

    def get_all_by_user(self, user_id: str) -> List[MedicalReport]:
        return self.db.query(MedicalReport).filter(MedicalReport.user_id == user_id).order_by(MedicalReport.created_at.desc()).all()

    def delete(self, report_id: str) -> bool:
        report = self.get_by_id(report_id)
        if report:
            self.db.delete(report)
            self.db.commit()
            return True
        return False


class HealthHistoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: str, title: str, description: str) -> HealthHistory:
        history = HealthHistory(
            user_id=user_id,
            title=title,
            description=description
        )
        self.db.add(history)
        self.db.commit()
        self.db.refresh(history)
        return history

    def get_by_id(self, history_id: str) -> Optional[HealthHistory]:
        return self.db.query(HealthHistory).filter(HealthHistory.id == history_id).first()

    def get_all_by_user(self, user_id: str) -> List[HealthHistory]:
        return self.db.query(HealthHistory).filter(HealthHistory.user_id == user_id).order_by(HealthHistory.created_at.desc()).all()

    def delete(self, history_id: str) -> bool:
        history = self.get_by_id(history_id)
        if history:
            self.db.delete(history)
            self.db.commit()
            return True
        return False


class ConversationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: str, report_id: Optional[str] = None, title: str = "New Consultation") -> Conversation:
        convo = Conversation(
            user_id=user_id,
            report_id=report_id,
            title=title
        )
        self.db.add(convo)
        self.db.commit()
        self.db.refresh(convo)
        return convo

    def get_by_id(self, conversation_id: str) -> Optional[Conversation]:
        return self.db.query(Conversation).filter(Conversation.id == conversation_id).first()

    def get_all_by_user(self, user_id: str) -> List[Conversation]:
        return self.db.query(Conversation).filter(Conversation.user_id == user_id).order_by(Conversation.created_at.desc()).all()

    def add_message(self, conversation_id: str, user_id: str, question: str, answer: str, report_id: Optional[str] = None) -> ChatHistory:
        msg = ChatHistory(
            conversation_id=conversation_id,
            user_id=user_id,
            report_id=report_id,
            question=question,
            answer=answer
        )
        self.db.add(msg)
        
        # Also update updated_at on parent conversation
        convo = self.get_by_id(conversation_id)
        if convo:
            convo.updated_at = datetime.utcnow()
            
        self.db.commit()
        self.db.refresh(msg)
        return msg

    def get_messages(self, conversation_id: str) -> List[ChatHistory]:
        return self.db.query(ChatHistory).filter(ChatHistory.conversation_id == conversation_id).order_by(ChatHistory.created_at.asc()).all()

    def delete(self, conversation_id: str) -> bool:
        convo = self.get_by_id(conversation_id)
        if convo:
            self.db.delete(convo)
            self.db.commit()
            return True
        return False


class SpecialistRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, specialist_id: str) -> Optional[Specialist]:
        return self.db.query(Specialist).filter(Specialist.id == specialist_id).first()

    def get_by_name(self, name: str) -> Optional[Specialist]:
        return self.db.query(Specialist).filter(Specialist.name == name).first()

    def get_all(self) -> List[Specialist]:
        return self.db.query(Specialist).order_by(Specialist.name.asc()).all()


class ReminderRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: str, title: str, description: Optional[str], reminder_date: datetime) -> Reminder:
        reminder = Reminder(
            user_id=user_id,
            title=title,
            description=description or "",
            reminder_date=reminder_date,
            is_completed=False
        )
        self.db.add(reminder)
        self.db.commit()
        self.db.refresh(reminder)
        return reminder

    def get_by_id(self, reminder_id: str) -> Optional[Reminder]:
        return self.db.query(Reminder).filter(Reminder.id == reminder_id).first()

    def get_all_by_user(self, user_id: str) -> List[Reminder]:
        return self.db.query(Reminder).filter(Reminder.user_id == user_id).order_by(Reminder.reminder_date.asc()).all()

    def mark_completed(self, reminder_id: str, is_completed: bool = True) -> Optional[Reminder]:
        reminder = self.get_by_id(reminder_id)
        if reminder:
            reminder.is_completed = is_completed
            reminder.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(reminder)
        return reminder

    def delete(self, reminder_id: str) -> bool:
        reminder = self.get_by_id(reminder_id)
        if reminder:
            self.db.delete(reminder)
            self.db.commit()
            return True
        return False


class AuditLogRepository:
    def __init__(self, db: Session):
        self.db = db

    def log(self, user_id: Optional[str], action: str, details: Optional[str] = None, ip_address: Optional[str] = None) -> AuditLog:
        log_entry = AuditLog(
            user_id=user_id,
            action=action,
            details=details,
            ip_address=ip_address
        )
        self.db.add(log_entry)
        self.db.commit()
        self.db.refresh(log_entry)
        return log_entry
