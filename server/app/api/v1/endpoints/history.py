from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.auth import User
from app.dependencies.dependencies import get_current_user
from app.repositories.db_repositories import HealthHistoryRepository
from app.schema.auth import MessageResponse
from app.schema.history import HealthHistoryResponse
from typing import List

router = APIRouter()

@router.get("/", response_model=MessageResponse[List[HealthHistoryResponse]], status_code=status.HTTP_200_OK)
async def get_health_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve all health history records and summaries for the authenticated patient.
    """
    repo = HealthHistoryRepository(db)
    history = repo.get_all_by_user(current_user.id)
    return MessageResponse(message="Health history records retrieved", data=history)


@router.delete("/{history_id}", status_code=status.HTTP_200_OK)
async def delete_history_record(
    history_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a specific health history record.
    """
    repo = HealthHistoryRepository(db)
    record = repo.get_by_id(history_id)
    
    if not record:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Health history record not found.")
    if record.user_id != current_user.id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not authorized to delete this history record.")
        
    repo.delete(history_id)
    return MessageResponse(message="Health history record deleted successfully")
