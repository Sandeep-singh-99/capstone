from app.graph.state import AgentState
from app.rag.retriever import retrieve_medical_context
from app.utils.llm import get_llm
from langchain_core.messages import SystemMessage, HumanMessage

def run_medical_knowledge_agent(state: AgentState) -> AgentState:
    """
    RAG-powered node that fetches medical educational reference material and translates
    complex clinical results/symptoms into simple patient-facing educational summaries.
    """
    print("--- [Agent] Medical Knowledge Agent ---")
    
    # 1. Determine query to search in RAG
    query_parts = []
    if state.get("symptoms"):
        query_parts.extend(state["symptoms"])
    if state.get("extracted_text"):
        # Extract a short summary of the text to search for context
        query_parts.append(state["extracted_text"][:800])
    if state.get("input_text"):
        query_parts.append(state["input_text"])
        
    search_query = " ".join(query_parts) if query_parts else "general wellness"
    
    # 2. Retrieve trusted context
    print(f"Retrieving medical context for search query: '{search_query[:100]}...'")
    context = retrieve_medical_context(search_query, k=2)
    state["medical_info"] = context
    
    # 3. Use LLM to summarize in simple language
    llm = get_llm()
    system_prompt = (
        "You are an empathetic, educational medical communicator. "
        "Your task is to explain the patient's symptoms or medical report findings using the provided "
        "clinical database reference context.\n\n"
        "Rules:\n"
        "1. Translate complex medical terms or high/low lab results into simple, plain English.\n"
        "2. Explain *why* these values matter and what they generally indicate educationally.\n"
        "3. NEVER diagnose the patient or prescribe medication/treatments. Always speak in general educational terms.\n"
        "4. Include a prominent disclaimer: 'Disclaimer: This information is for educational purposes only. It is not a diagnosis. Please consult a qualified healthcare professional.'\n\n"
        "Clinical Context Reference:\n"
        f"{context}"
    )
    
    user_input = ""
    if state.get("extracted_text"):
        user_input += f"Medical Report findings:\n{state['extracted_text']}\n\n"
    if state.get("symptoms"):
        user_input += f"Patient Symptoms: {', '.join(state['symptoms'])}\n\n"
    if state.get("input_text"):
        user_input += f"Patient Query: {state['input_text']}"
        
    try:
        res = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_input)
        ])
        state["response"] = res.content
    except Exception as e:
        print(f"Medical Knowledge Agent LLM error: {e}")
        state["response"] = (
            f"Based on educational references:\n{context}\n\n"
            "Disclaimer: This is for educational purposes only. Please consult a qualified doctor."
        )
        
    return state
