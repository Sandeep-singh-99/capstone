from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from fastapi import HTTPException
from app.repositories.db_repositories import ReminderRepository

class ReminderService:
    @staticmethod
    def create_reminder(db: Session, user_id: str, title: str, description: Optional[str], reminder_date: datetime):
        repo = ReminderRepository(db)
        return repo.create(user_id=user_id, title=title, description=description, reminder_date=reminder_date)

    @staticmethod
    def list_reminders(db: Session, user_id: str):
        repo = ReminderRepository(db)
        return repo.get_all_by_user(user_id)

    @staticmethod
    def mark_completed(db: Session, user_id: str, reminder_id: str, is_completed: bool = True):
        repo = ReminderRepository(db)
        reminder = repo.get_by_id(reminder_id)
        if not reminder:
            raise HTTPException(status_code=404, detail="Reminder not found.")
        if reminder.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to edit this reminder.")
        return repo.mark_completed(reminder_id, is_completed)

    @staticmethod
    def delete_reminder(db: Session, user_id: str, reminder_id: str):
        repo = ReminderRepository(db)
        reminder = repo.get_by_id(reminder_id)
        if not reminder:
            raise HTTPException(status_code=404, detail="Reminder not found.")
        if reminder.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this reminder.")
        repo.delete(reminder_id)
        return {"message": "Reminder deleted successfully."}
