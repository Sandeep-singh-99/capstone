from app.graph.state import AgentState
from app.mcp.history_server import save_history
from app.core.database import SessionLocal
from app.repositories.db_repositories import MedicalReportRepository, ConversationRepository

def run_history_agent(state: AgentState) -> AgentState:
    """
    Agent node that interfaces with History MCP tools and repositories to persist
    uploaded reports, summaries, and chat messages in the database.
    """
    print("--- [Agent] History Agent ---")
    user_id = state.get("user_id")
    file_url = state.get("file_url")
    file_type = state.get("file_type")
    extracted_text = state.get("extracted_text")
    ai_summary = state.get("response")
    input_text = state.get("input_text")
    conversation_id = state.get("conversation_id")
    
    db = SessionLocal()
    try:
        # 1. If a report file was uploaded, save it to MedicalReport table
        if file_url and file_type:
            report_repo = MedicalReportRepository(db)
            print(f"Saving uploaded {file_type} report to DB...")
            report = report_repo.create(
                user_id=user_id,
                file_url=file_url,
                file_public_id=state.get("file_public_id", "external"),
                file_type=file_type,
                input_text=input_text,
                extracted_text=extracted_text,
                ai_summary=ai_summary
            )
            print(f"Report saved. ID: {report.id}")
            
            # Also save general summary to HealthHistory via MCP
            save_history(
                user_id=user_id,
                title=f"Uploaded Medical {file_type.capitalize()}",
                description=f"AI Summary: {ai_summary[:200]}..."
            )
            
        # 2. If this is a conversational query and conversation_id exists, save message
        if conversation_id and input_text and ai_summary:
            convo_repo = ConversationRepository(db)
            print(f"Saving chat message to conversation {conversation_id}...")
            convo_repo.add_message(
                conversation_id=conversation_id,
                user_id=user_id,
                question=input_text,
                answer=ai_summary,
                report_id=None # Optionally link if related to a specific report
            )
            
        # 3. If it's a symptom check, save general symptom log via MCP
        elif state.get("symptoms") and ai_summary:
            symptom_str = ", ".join(state["symptoms"])
            print("Saving symptom milestone to health history...")
            save_history(
                user_id=user_id,
                title=f"Symptom Check: {symptom_str[:50]}",
                description=f"Reported symptoms: {symptom_str}. AI Response: {ai_summary[:200]}..."
            )
            
    except Exception as e:
        print(f"History Agent database persistence error: {e}")
    finally:
        db.close()
        
    return state
