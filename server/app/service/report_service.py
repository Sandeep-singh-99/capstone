import uuid
from typing import Optional
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from app.utils.cloudinary import upload_image, delete_image
from app.repositories.db_repositories import MedicalReportRepository, AuditLogRepository
from app.graph.graph import compiled_graph

class ReportService:
    @staticmethod
    def process_report_upload(db: Session, user_id: str, file: UploadFile, ip_address: Optional[str] = None):
        """
        Validate report, upload to Cloudinary, and trigger the LangGraph multi-agent pipeline.
        """
        filename = file.filename.lower()
        if filename.endswith(('.png', '.jpg', '.jpeg', '.gif')):
            file_type = "image"
        elif filename.endswith('.pdf'):
            file_type = "pdf"
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file format. Only images (PNG, JPG, JPEG) and PDF documents are supported."
            )
            
        # 1. Upload to Cloudinary
        print(f"Uploading {file_type} report '{file.filename}' to Cloudinary...")
        try:
            cloudinary_result = upload_image(file.file, folder="MediGuide_Reports")
            file_url = cloudinary_result["url"]
            file_public_id = cloudinary_result["public_id"]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Cloudinary file upload failed: {str(e)}"
            )
            
        # 2. Invoke LangGraph multi-agent pipeline
        print("Invoking LangGraph multi-agent pipeline...")
        thread_id = str(uuid.uuid4())
        config = {"configurable": {"thread_id": thread_id}}
        
        initial_state = {
            "user_id": user_id,
            "conversation_id": None,
            "input_text": f"Uploaded {file_type} report: {file.filename}",
            "file_url": file_url,
            "file_public_id": file_public_id,
            "file_type": file_type,
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
                action="REPORT_UPLOAD",
                details=f"Uploaded {file_type}. Thread ID: {thread_id}",
                ip_address=ip_address
            )
            
            # Find the saved report in the database to return
            report_repo = MedicalReportRepository(db)
            user_reports = report_repo.get_all_by_user(user_id)
            latest_report = None
            if user_reports:
                latest_report = user_reports[0] # The list is ordered by created_at desc
                
            return {
                "report": latest_report,
                "analysis": final_state.get("response"),
                "extracted_text": final_state.get("extracted_text"),
                "symptoms": final_state.get("symptoms"),
                "recommendations": final_state.get("recommendations")
            }
            
        except Exception as e:
            # Rollback Cloudinary if pipeline crashes
            print(f"Pipeline execution failed. Destroying uploaded file: {file_public_id}")
            delete_image(file_public_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"MediGuide multi-agent pipeline failed: {str(e)}"
            )

    @staticmethod
    def get_report(db: Session, user_id: str, report_id: str):
        report_repo = MedicalReportRepository(db)
        report = report_repo.get_by_id(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Medical report not found.")
        if report.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this report.")
        return report

    @staticmethod
    def delete_report(db: Session, user_id: str, report_id: str):
        report_repo = MedicalReportRepository(db)
        report = report_repo.get_by_id(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Medical report not found.")
        if report.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this report.")
            
        # Delete from Cloudinary
        if report.file_public_id:
            try:
                delete_image(report.file_public_id)
            except Exception as e:
                print(f"Failed to delete file {report.file_public_id} from Cloudinary: {e}")
                
        report_repo.delete(report_id)
        return {"message": "Report deleted successfully."}
