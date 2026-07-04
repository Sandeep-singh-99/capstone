from fastmcp import FastMCP
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.health_history import HealthHistory
from app.models.medical_report import MedicalReport

mcp = FastMCP("History")

@mcp.tool()
def save_history(user_id: str, title: str, description: str) -> str:
    """
    Save a health summary or milestone into the patient's health history records.
    """
    db: Session = SessionLocal()
    try:
        history_entry = HealthHistory(
            user_id=user_id,
            title=title,
            description=description
        )
        db.add(history_entry)
        db.commit()
        db.refresh(history_entry)
        return f"Successfully saved health history record: '{title}' (ID: {history_entry.id})"
    except Exception as e:
        db.rollback()
        return f"Failed to save health history: {str(e)}"
    finally:
        db.close()

@mcp.tool()
def get_history(user_id: str) -> str:
    """
    Retrieve previous health history events, milestones, and summaries for a specific patient.
    """
    db: Session = SessionLocal()
    try:
        records = db.query(HealthHistory).filter(HealthHistory.user_id == user_id).order_by(HealthHistory.created_at.desc()).all()
        if not records:
            return "No previous health history records found for this user."
            
        summary_lines = []
        for rec in records:
            date_str = rec.created_at.strftime("%Y-%m-%d %H:%M:%S")
            summary_lines.append(f"[{date_str}] {rec.title}\nDescription: {rec.description}")
            
        return "Patient Health History:\n\n" + "\n\n".join(summary_lines)
    except Exception as e:
        return f"Failed to retrieve health history: {str(e)}"
    finally:
        db.close()

@mcp.tool()
def compare_reports(report_id_1: str, report_id_2: str) -> str:
    """
    Compare two medical reports side by side (e.g. lab result trends) to help track physiological progress.
    """
    db: Session = SessionLocal()
    try:
        report1 = db.query(MedicalReport).filter(MedicalReport.id == report_id_1).first()
        report2 = db.query(MedicalReport).filter(MedicalReport.id == report_id_2).first()
        
        if not report1:
            return f"Report 1 (ID: {report_id_1}) not found."
        if not report2:
            return f"Report 2 (ID: {report_id_2}) not found."
            
        comparison = f"### Comparing Medical Reports\n\n"
        comparison += f"**Report 1 (Uploaded: {report1.created_at.strftime('%Y-%m-%d')})**:\n"
        comparison += f"- File Type: {report1.file_type or 'Unknown'}\n"
        comparison += f"- Extracted text summary: {report1.extracted_text[:300] or 'No extracted text'}...\n"
        comparison += f"- AI summary: {report1.ai_summary or 'No AI summary'}\n\n"
        
        comparison += f"**Report 2 (Uploaded: {report2.created_at.strftime('%Y-%m-%d')})**:\n"
        comparison += f"- File Type: {report2.file_type or 'Unknown'}\n"
        comparison += f"- Extracted text summary: {report2.extracted_text[:300] or 'No extracted text'}...\n"
        comparison += f"- AI summary: {report2.ai_summary or 'No AI summary'}\n\n"
        
        comparison += f"**Comparison Overview**:\n"
        comparison += f"Review the AI summaries above to see trends (e.g., changes in cholesterol, blood glucose, or metabolic counts) between the two dates.\n"
        comparison += f"\nDisclaimer: This comparison is educational only. Consult your specialist to interpret these changes."
        
        return comparison
    except Exception as e:
        return f"Failed to compare reports: {str(e)}"
    finally:
        db.close()
