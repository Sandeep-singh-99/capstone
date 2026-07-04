import os
from dotenv import load_dotenv
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import BaseMessage, AIMessage
from langchain_core.outputs import ChatResult, ChatGeneration
from typing import Any, List, Optional
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

class MockChatGemini(BaseChatModel):
    """Fallback Mock LLM when no Gemini API Key is configured."""
    
    def _generate(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[Any] = None,
        **kwargs: Any,
    ) -> ChatResult:
        # Simple rule-based mock response based on prompt contents
        prompt_text = " ".join([m.content if isinstance(m.content, str) else str(m.content) for m in messages]).lower()
        
        response_text = ""
        
        if "classify" in prompt_text or "planner" in prompt_text or "routing" in prompt_text:
            # Planner agent
            if "pdf" in prompt_text or ".pdf" in prompt_text:
                response_text = "pdf"
            elif "image" in prompt_text or ".png" in prompt_text or ".jpg" in prompt_text or ".jpeg" in prompt_text:
                response_text = "image"
            elif "symptom" in prompt_text or "fever" in prompt_text or "pain" in prompt_text or "rash" in prompt_text:
                response_text = "symptoms"
            else:
                response_text = "chat"
        elif "image reader" in prompt_text or "vision" in prompt_text:
            response_text = (
                "Extracted Medical Information from Image:\n"
                "- Patient: John Doe\n"
                "- Lab parameter: Total Cholesterol is 245 mg/dL (Elevated)\n"
                "- Lab parameter: WBC is 8.5k/mcL (Normal)\n"
                "- Clinical Summary: Mild hypercholesterolemia. Other markers are within normal limits."
            )
        elif "report reader" in prompt_text or "pdf reader" in prompt_text:
            response_text = (
                "Extracted Medical Information from PDF Report:\n"
                "- Lab values: HbA1c is 6.2% (Prediabetes range)\n"
                "- Lab values: Fasting Glucose is 112 mg/dL (Prediabetes range)\n"
                "- Report Summary: Impaired fasting glucose and elevated HbA1c, indicating prediabetes."
            )
        elif "symptom reader" in prompt_text or "extract symptoms" in prompt_text:
            # We want structured output, let's return JSON-like string
            response_text = '{"symptoms": ["fever", "sore throat", "cough"]}'
            if "chest pain" in prompt_text:
                response_text = '{"symptoms": ["chest pain", "shortness of breath"]}'
            elif "skin rash" in prompt_text:
                response_text = '{"symptoms": ["skin rash", "itching"]}'
        elif "doctor recommendation" in prompt_text or "recommend specialist" in prompt_text:
            response_text = "Cardiologist"
            if "rash" in prompt_text:
                response_text = "Dermatologist"
            elif "eye" in prompt_text:
                response_text = "Ophthalmologist"
        elif "medical knowledge" in prompt_text or "rag" in prompt_text:
            response_text = (
                "Based on clinical education records:\n"
                "- HbA1c measures average blood sugar over 3 months. A level between 5.7% and 6.4% indicates prediabetes.\n"
                "- Cholesterol values above 200 mg/dL indicate borderline or high levels, which can affect heart health.\n"
                "\nDisclaimer: This information is strictly for educational purposes. It is not a medical diagnosis. Please consult a qualified physician."
            )
        else:
            # General Chat response
            response_text = (
                "Hello! I am MediGuide AI, your educational health information navigator. "
                "I can help explain medical terms, lab results, and suggest appropriate specialties to consult.\n\n"
                "How can I help you understand your health parameters today?\n\n"
                "Disclaimer: This is for educational purposes only. Always consult a healthcare provider."
            )
            
        message = AIMessage(content=response_text)
        generation = ChatGeneration(message=message)
        return ChatResult(generations=[generation])

    @property
    def _llm_type(self) -> str:
        return "mock-chat-gemini"

def get_llm(temperature: float = 0.0) -> BaseChatModel:
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        print("WARNING: GEMINI_API_KEY/GOOGLE_API_KEY not found in environment. Using MockChatGemini.")
        return MockChatGemini()
        
    if not os.getenv("GOOGLE_API_KEY"):
        os.environ["GOOGLE_API_KEY"] = api_key
        
    try:
        return ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=temperature,
            google_api_key=api_key
        )
    except Exception as e:
        print(f"Error initializing ChatGoogleGenerativeAI: {e}. Falling back to MockChatGemini.")
        return MockChatGemini()
