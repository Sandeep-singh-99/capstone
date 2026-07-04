from app.graph.state import AgentState
from app.utils.llm import get_llm
from langchain_core.messages import SystemMessage, HumanMessage

def run_planner_agent(state: AgentState) -> AgentState:
    """
    Orchestrator node that classifies input and routes to the appropriate next agent.
    """
    print("--- [Agent] Planner Agent ---")
    
    # 1. Routing based on explicit file types
    if state.get("file_type") == "image" or (state.get("file_url") and state.get("file_url").lower().endswith(('.png', '.jpg', '.jpeg', '.gif'))):
        state["next_node"] = "image_reader"
        return state
        
    if state.get("file_type") == "pdf" or (state.get("file_url") and state.get("file_url").lower().endswith('.pdf')):
        state["next_node"] = "report_reader"
        return state
        
    # 2. Routing text query based on LLM classification
    input_text = state.get("input_text", "")
    if not input_text:
        state["next_node"] = "chat"
        return state
        
    llm = get_llm()
    system_prompt = (
        "You are the routing planner for a healthcare navigator. "
        "Your task is to classify the user's text input into one of two routing nodes:\n"
        "- 'symptoms': If the user describes new physical symptoms, pain, rashes, or feeling sick.\n"
        "- 'chat': If the user is asking general questions, follow-ups about previous reports, or conversational pleasantries.\n\n"
        "Respond with ONLY one word: either 'symptoms' or 'chat'."
    )
    
    try:
        response = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=input_text)
        ])
        decision = response.content.strip().lower()
        if "symptom" in decision:
            state["next_node"] = "symptom_reader"
        else:
            state["next_node"] = "chat"
    except Exception as e:
        print(f"Planner Agent error: {e}. Falling back to 'chat'.")
        state["next_node"] = "chat"
        
    print(f"Planner routing decision: {state['next_node']}")
    return state
