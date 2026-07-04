from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.auth import User
from app.dependencies.dependencies import get_current_user
from app.service.reminder_service import ReminderService
from app.schema.reminder import CreateReminderRequest, ReminderResponse
from app.schema.auth import MessageResponse
from typing import List

router = APIRouter()

@router.post("/", response_model=MessageResponse[ReminderResponse], status_code=status.HTTP_201_CREATED)
async def create_new_reminder(
    body: CreateReminderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new health or medication reminder.
    """
    reminder = ReminderService.create_reminder(
        db=db,
        user_id=current_user.id,
        title=body.title,
        description=body.description,
        reminder_date=body.reminder_date
    )
    return MessageResponse(message="Reminder created successfully", data=reminder)


@router.get("/", response_model=MessageResponse[List[ReminderResponse]], status_code=status.HTTP_200_OK)
async def list_patient_reminders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve all reminders set for the authenticated patient.
    """
    reminders = ReminderService.list_reminders(db, current_user.id)
    return MessageResponse(message="Reminders list retrieved", data=reminders)


@router.patch("/{reminder_id}/complete", response_model=MessageResponse[ReminderResponse], status_code=status.HTTP_200_OK)
async def mark_reminder_as_completed(
    reminder_id: str,
    is_completed: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mark a reminder as completed or incomplete.
    """
    reminder = ReminderService.mark_completed(db, current_user.id, reminder_id, is_completed)
    return MessageResponse(message="Reminder update status processed", data=reminder)


@router.delete("/{reminder_id}", status_code=status.HTTP_200_OK)
async def delete_patient_reminder(
    reminder_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a specific reminder.
    """
    result = ReminderService.delete_reminder(db, current_user.id, reminder_id)
    return MessageResponse(message=result["message"])
