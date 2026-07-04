from app.graph.state import AgentState
from app.utils.llm import get_llm
from langchain_core.messages import HumanMessage

def run_image_reader_agent(state: AgentState) -> AgentState:
    """
    Multimodal node that analyzes medical report screenshots or images using Gemini Vision.
    """
    print("--- [Agent] Image Reader Agent ---")
    file_url = state.get("file_url")
    if not file_url:
        state["extracted_text"] = "No image file URL was provided."
        return state
        
    llm = get_llm()
    prompt = (
        "You are a medical report reader. Analyze the attached medical report image or scan. "
        "Your goal is to extract: "
        "1. Patient name and demographic details if visible. "
        "2. All laboratory test names, recorded values, and standard reference ranges. "
        "3. Any clinical impressions, signatures, or dates. "
        "Expose the output in a structured, readable format. "
        "Only output what is visible. If the image is not a medical report, return a message saying so. "
        "Never add diagnoses. Always include a disclaimer."
    )
    
    try:
        message = HumanMessage(
            content=[
                {"type": "text", "text": prompt},
                {
                    "type": "image_url",
                    "image_url": {"url": file_url},
                },
            ]
        )
        response = llm.invoke([message])
        state["extracted_text"] = response.content
    except Exception as e:
        print(f"Image Reader Agent error: {e}. Falling back to text extraction placeholder.")
        state["extracted_text"] = f"Failed to parse image from {file_url} due to an error: {str(e)}"
        
    return state
