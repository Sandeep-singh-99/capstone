from app.graph.state import AgentState
from app.mcp.recommendation_server import recommend_specialist

def run_doctor_recommendation_agent(state: AgentState) -> AgentState:
    """
    Agent node that uses Recommendation MCP tools to suggest the appropriate medical specialist
    based on the structured list of symptoms.
    """
    print("--- [Agent] Doctor Recommendation Agent ---")
    symptoms = state.get("symptoms", [])
    
    # Fallback to input text if symptoms list is empty
    if not symptoms and state.get("input_text"):
        symptoms = [state["input_text"]]
        
    if symptoms:
        print(f"Calling Recommendation MCP tools for symptoms: {symptoms}")
        recommendation_text = recommend_specialist(symptoms)
        
        # Parse out specialist name from result if possible (just for state persistence)
        spec_name = "General Practitioner"
        for line in recommendation_text.split("\n"):
            if "Recommended Specialist:" in line:
                spec_name = line.replace("Recommended Specialist:", "").strip()
                break
                
        state["recommendations"] = [spec_name]
        
        # Append recommendation text to the final response
        if state.get("response"):
            state["response"] += f"\n\n---\n\n### Specialty Consulting Recommendation\n\n{recommendation_text}"
        else:
            state["response"] = recommendation_text
    else:
        state["recommendations"] = []
        
    return state
