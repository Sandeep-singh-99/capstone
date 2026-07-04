from app.graph.state import AgentState
from app.rag.retriever import retrieve_medical_context
from app.utils.llm import get_llm
from app.core.database import SessionLocal
from app.repositories.db_repositories import ConversationRepository, MedicalReportRepository
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

def run_chat_agent(state: AgentState) -> AgentState:
    """
    Conversational agent node that responds to general user questions and follow-ups.
    Uses previous reports, chat history, and RAG context to formulate answers.
    """
    print("--- [Agent] Chat Agent ---")
    user_id = state.get("user_id")
    conversation_id = state.get("conversation_id")
    input_text = state.get("input_text", "")
    
    db = SessionLocal()
    chat_history_messages = []
    previous_reports_summary = ""
    
    try:
        # 1. Retrieve conversation messages from DB if conversation_id is provided
        if conversation_id:
            convo_repo = ConversationRepository(db)
            messages = convo_repo.get_messages(conversation_id)
            print(f"Loaded {len(messages)} historical messages from DB.")
            for msg in messages:
                chat_history_messages.append(HumanMessage(content=msg.question))
                chat_history_messages.append(AIMessage(content=msg.answer))
                
        # 2. Retrieve previous report summaries to give context
        report_repo = MedicalReportRepository(db)
        reports = report_repo.get_all_by_user(user_id)
        if reports:
            summaries = []
            for i, r in enumerate(reports[:3], 1): # Take up to 3 latest reports
                date_str = r.created_at.strftime("%Y-%m-%d")
                summaries.append(f"Report {i} ({date_str}, Type: {r.file_type}):\n{r.ai_summary or r.extracted_text[:300]}")
            previous_reports_summary = "\n\n".join(summaries)
            print(f"Loaded {len(reports)} previous reports for context.")
            
    except Exception as e:
        print(f"Chat Agent failed to load history/reports: {e}")
    finally:
        db.close()
        
    # 3. Retrieve relevant medical context from RAG
    rag_context = retrieve_medical_context(input_text, k=2)
    
    # 4. Formulate Prompt and invoke LLM
    llm = get_llm()
    system_prompt = (
        "You are MediGuide AI, an intelligent, conversational healthcare information navigator. "
        "Your task is to answer the user's health question or explain their reports clearly and simply.\n\n"
        "Rules:\n"
        "1. Answer using the provided medical reference database. Translate jargon into simple terms.\n"
        "2. Use previous report context to personalize your answer if applicable.\n"
        "3. NEVER diagnose, prescribe treatments, or make specific recommendations for drugs or doctors.\n"
        "4. Always include a clear disclaimer: 'Disclaimer: This is for educational purposes only. Always consult a healthcare professional.'\n\n"
        f"Medical Knowledge Base Reference:\n"
        f"{rag_context}\n\n"
    )
    
    if previous_reports_summary:
        system_prompt += f"Patient's Previous Reports Context:\n{previous_reports_summary}\n\n"
        
    messages_to_send = [SystemMessage(content=system_prompt)]
    
    # Append conversation memory
    messages_to_send.extend(chat_history_messages)
    
    # Append current message
    messages_to_send.append(HumanMessage(content=input_text))
    
    try:
        res = llm.invoke(messages_to_send)
        state["response"] = res.content
    except Exception as e:
        print(f"Chat Agent LLM invocation error: {e}")
        state["response"] = (
            "I apologize, but I encountered an error while processing your request. "
            "Please check back shortly.\n\n"
            "Disclaimer: This is for educational purposes only. Always consult a doctor."
        )
        
    return state
