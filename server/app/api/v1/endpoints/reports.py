from fastapi import APIRouter, Depends, UploadFile, File, Request, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.auth import User
from app.dependencies.dependencies import get_current_user
from app.service.report_service import ReportService
from app.schema.report import MedicalReportResponse, ReportUploadResponse
from app.schema.auth import MessageResponse
from app.security.security import validate_uploaded_file, check_rate_limit

router = APIRouter()

@router.post("/upload", response_model=MessageResponse[ReportUploadResponse], status_code=status.HTTP_201_CREATED, dependencies=[Depends(check_rate_limit)])
async def upload_report(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a medical report image or PDF.
    This triggers the multi-agent LangGraph workflow to extract clinical details and return an AI analysis.
    """
    # Run security file checks
    validate_uploaded_file(file)
    
    ip_address = request.client.host if request.client else None
    
    # We validate and delegate to service
    result = ReportService.process_report_upload(
        db=db,
        user_id=current_user.id,
        file=file,
        ip_address=ip_address
    )
    
    return MessageResponse(
        message="Report uploaded and analyzed successfully",
        data=result
    )


@router.get("/{report_id}", response_model=MessageResponse[MedicalReportResponse], status_code=status.HTTP_200_OK)
async def get_report_details(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve details of a previously uploaded medical report.
    """
    report = ReportService.get_report(db, current_user.id, report_id)
    return MessageResponse(message="Report details retrieved", data=report)


@router.delete("/{report_id}", status_code=status.HTTP_200_OK)
async def delete_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a medical report and sync-remove its file from Cloudinary storage.
    """
    result = ReportService.delete_report(db, current_user.id, report_id)
    return MessageResponse(message=result["message"])
