import io
import requests
from pypdf import PdfReader
from app.graph.state import AgentState
from app.utils.llm import get_llm
from langchain_core.messages import SystemMessage, HumanMessage

def run_report_reader_agent(state: AgentState) -> AgentState:
    """
    Agent node that downloads and parses PDF medical reports, extracts text,
    and structures lab values and medical summaries.
    """
    print("--- [Agent] Report Reader Agent ---")
    file_url = state.get("file_url")
    if not file_url:
        state["extracted_text"] = "No report PDF URL was provided."
        return state
        
    extracted_raw = ""
    try:
        # Download the PDF from the URL
        response = requests.get(file_url, timeout=15)
        response.raise_for_status()
        
        # Load PDF bytes
        pdf_file = io.BytesIO(response.content)
        reader = PdfReader(pdf_file)
        
        text_pages = []
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            text_pages.append(f"--- Page {i+1} ---\n{page_text}")
            
        extracted_raw = "\n".join(text_pages)
        print(f"Extracted {len(extracted_raw)} characters from PDF.")
        
    except Exception as e:
        print(f"Failed to read/download PDF: {e}")
        state["extracted_text"] = f"Failed to download/parse PDF: {str(e)}"
        return state

    if not extracted_raw.strip():
        state["extracted_text"] = "The PDF file was successfully parsed but appeared to contain no readable text."
        return state
        
    # Structure the extracted text using Gemini
    llm = get_llm()
    system_prompt = (
        "You are an expert medical report reader. Analyze the raw text extracted from a patient's PDF report.\n"
        "Your task is to structure it by identifying:\n"
        "1. Lab values, test parameters, results, and reference ranges.\n"
        "2. Clinical terms and abbreviations.\n"
        "3. Key diagnostic observations, recommendations, or doctor signatures.\n\n"
        "Format it in clear Markdown. Do not diagnose the patient. Maintain an educational tone. Include disclaimers."
    )
    
    try:
        res = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=extracted_raw[:20000]) # Cap input text length
        ])
        state["extracted_text"] = res.content
    except Exception as e:
        print(f"Report Reader LLM structuring error: {e}")
        state["extracted_text"] = f"Raw text extracted from PDF:\n{extracted_raw}"
        
    return state
