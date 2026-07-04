from typing import TypedDict, List, Dict, Any, Optional

class AgentState(TypedDict):
    # Patient identifiers
    user_id: str
    conversation_id: Optional[str]
    
    # Inputs
    input_text: Optional[str]        # Symptoms descriptions or chat message
    file_url: Optional[str]          # Image or PDF url
    file_type: Optional[str]         # 'image', 'pdf', or None
    
    # Extracted data
    extracted_text: Optional[str]    # Raw text extracted from file
    symptoms: List[str]              # List of symptoms extracted
    
    # Processed states
    medical_info: Optional[str]      # Retrieved RAG context
    recommendations: List[str]       # Recommended specialties
    reminders: List[str]             # Created reminders
    
    # Message logs for conversational agents
    messages: List[Dict[str, Any]]   # Chat history representation
    
    # Outputs
    response: Optional[str]          # Final output returned to API caller
    next_node: Optional[str]         # Node routing parameter
