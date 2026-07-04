from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.auth import User
from app.dependencies.dependencies import get_current_user
from app.service.specialist_service import SpecialistService
from app.schema.specialist import RecommendSpecialistRequest, SpecialistResponse, RecommendSpecialistResponse
from app.schema.auth import MessageResponse
from typing import List

router = APIRouter()

@router.post("/recommend", response_model=MessageResponse[RecommendSpecialistResponse], status_code=status.HTTP_200_OK)
async def recommend_specialty(
    body: RecommendSpecialistRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Recommend the appropriate medical specialty based on a list of extracted symptoms.
    """
    result = SpecialistService.recommend_specialist_by_symptoms(db, body.symptoms)
    return MessageResponse(message="Specialist recommendation processed", data=result)


@router.get("/", response_model=MessageResponse[List[SpecialistResponse]], status_code=status.HTTP_200_OK)
async def list_all_specialties(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve all specialties available in the system catalog along with details.
    """
    specialties = SpecialistService.list_specialties(db)
    return MessageResponse(message="Specialties directory retrieved", data=specialties)
