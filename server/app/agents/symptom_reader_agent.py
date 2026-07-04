import json
import re
from app.graph.state import AgentState
from app.utils.llm import get_llm
from langchain_core.messages import SystemMessage, HumanMessage

def run_symptom_reader_agent(state: AgentState) -> AgentState:
    """
    Symptom reader agent that parses free-text patient descriptions and structures symptoms
    into a formal list of symptoms.
    """
    print("--- [Agent] Symptom Reader Agent ---")
    input_text = state.get("input_text", "")
    if not input_text:
        state["symptoms"] = []
        return state
        
    llm = get_llm()
    system_prompt = (
        "You are an AI symptom extraction tool. Analyze the patient's description of how they feel "
        "and return a JSON object containing a structured list of key physical symptoms.\n\n"
        "Example Input:\n"
        "\"I have been feeling dizzy since yesterday, and I also have a mild fever and sore throat.\"\n"
        "Example Output:\n"
        "{\n"
        "  \"symptoms\": [\"dizziness\", \"fever\", \"sore throat\"]\n"
        "}\n\n"
        "Your response MUST be valid JSON and contain ONLY the JSON block. Do not write markdown wrappers (like ```json)."
    )
    
    symptom_list = []
    try:
        res = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=input_text)
        ])
        
        # Clean response for json parsing (remove markdown code blocks if any)
        text = res.content.strip()
        text = re.sub(r"^```json\s*", "", text)
        text = re.sub(r"^```\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
        
        data = json.loads(text)
        symptom_list = data.get("symptoms", [])
        print(f"Extracted symptoms: {symptom_list}")
    except Exception as e:
        print(f"Symptom Reader Agent error: {e}. Falling back to regex splitting.")
        # Fallback regex/comma-based parsing if JSON fails
        words = re.findall(r"\b[a-zA-Z\s\-]{3,30}\b", input_text)
        symptom_list = [w.strip().lower() for w in words if "feel" not in w and "yesterday" not in w]
        
    state["symptoms"] = symptom_list
    return state
