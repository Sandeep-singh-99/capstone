from app.rag.vector_store import get_vector_store

def retrieve_medical_context(query: str, k: int = 3) -> str:
    """
    Retrieve relevant educational medical context from PGVector based on the query.
    """
    try:
        store = get_vector_store()
        results = store.similarity_search(query, k=k)
        
        if not results:
            return "No specific educational resources found for this query."
            
        context_blocks = []
        for i, doc in enumerate(results, 1):
            source = doc.metadata.get("source", "Unknown Source")
            content = doc.page_content.strip()
            context_blocks.append(f"--- Document {i} (Source: {source}) ---\n{content}")
            
        return "\n\n".join(context_blocks)
    except Exception as e:
        print(f"Error retrieving medical context: {e}")
        return "An error occurred while retrieving clinical educational knowledge. Please check configuration."
