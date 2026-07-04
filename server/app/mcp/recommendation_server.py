import json
from datetime import datetime
from fastmcp import FastMCP
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.specialist import Specialist
from app.models.reminder import Reminder

mcp = FastMCP("Recommendation")

@mcp.tool()
def recommend_specialist(symptoms: list[str]) -> str:
    """
    Recommend the appropriate clinical specialist based on a list of extracted symptoms (e.g. ['chest pain'] -> Cardiologist).
    """
    db: Session = SessionLocal()
    try:
        specialists = db.query(Specialist).all()
        matches = []
        
        # Lowercase all symptoms for matching
        symptoms_clean = [sym.strip().lower() for sym in symptoms]
        
        for spec in specialists:
            spec_symptoms = spec.symptoms or []
            # Check overlap
            overlap = [s for s in symptoms_clean if any(s in spec_sym.lower() or spec_sym.lower() in s for spec_sym in spec_symptoms)]
            if overlap:
                matches.append((spec, len(overlap)))
                
        if not matches:
            # Check for general fallback
            gp = db.query(Specialist).filter(Specialist.name == "General Practitioner").first()
            if gp:
                return (
                    f"Recommended Specialist: {gp.name}\n"
                    f"Reason: No specific specialist matches the input symptoms ({', '.join(symptoms)}). "
                    f"A General Practitioner (Primary Care Physician) is recommended for initial assessment.\n"
                    f"Description: {gp.description}"
                )
            return "No specialist matches found. Please consult a Primary Care Physician."
            
        # Sort matches by amount of overlapping symptoms desc
        matches.sort(key=lambda x: x[1], reverse=True)
        best_spec = matches[0][0]
        
        response = f"Recommended Specialist: {best_spec.name}\n"
        response += f"Description: {best_spec.description}\n"
        response += f"Matching symptoms detected: {', '.join(symptoms)}\n\n"
        response += f"Disclaimer: This recommendation is for educational routing. Do not delay seeking care."
        return response
    except Exception as e:
        return f"Failed to recommend specialist: {str(e)}"
    finally:
        db.close()

@mcp.tool()
def create_followup_reminder(user_id: str, title: str, description: str, date_str: str) -> str:
    """
    Create a health, medication, or specialist follow-up reminder for a patient.
    date_str format must be 'YYYY-MM-DD HH:MM:SS'.
    """
    db: Session = SessionLocal()
    try:
        try:
            reminder_date = datetime.strptime(date_str.strip(), "%Y-%m-%d %H:%M:%S")
        except ValueError:
            try:
                # Fallback to date only
                reminder_date = datetime.strptime(date_str.strip(), "%Y-%m-%d")
            except ValueError:
                return "Invalid date format. Please use 'YYYY-MM-DD HH:MM:SS' or 'YYYY-MM-DD'."
                
        reminder = Reminder(
            user_id=user_id,
            title=title,
            description=description,
            reminder_date=reminder_date,
            is_completed=False
        )
        db.add(reminder)
        db.commit()
        db.refresh(reminder)
        return f"Successfully created reminder: '{title}' set for {reminder_date.strftime('%Y-%m-%d %H:%M')} (ID: {reminder.id})"
    except Exception as e:
        db.rollback()
        return f"Failed to create reminder: {str(e)}"
    finally:
        db.close()

@mcp.tool()
def list_specialists() -> str:
    """
    List all clinical specialties stored in the system catalog along with details.
    """
    db: Session = SessionLocal()
    try:
        specialists = db.query(Specialist).all()
        if not specialists:
            return "No specialists found in the catalog."
            
        lines = []
        for spec in specialists:
            lines.append(f"- **{spec.name}**: {spec.description}\n  Handles: {', '.join(spec.symptoms or [])}")
            
        return "Clinical Specialist Directory:\n\n" + "\n\n".join(lines)
    except Exception as e:
        return f"Failed to list specialists: {str(e)}"
    finally:
        db.close()
