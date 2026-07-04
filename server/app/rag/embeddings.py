import os
from dotenv import load_dotenv
from langchain_core.embeddings import Embeddings
from langchain_google_genai import GoogleGenerativeAIEmbeddings

load_dotenv()

class MockEmbeddings(Embeddings):
    """Fallback mock embeddings class when no Google API Key is provided."""
    def __init__(self, dimension: int = 768):
        self.dimension = dimension

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        # Return dummy vector for each text chunk
        return [[0.0] * self.dimension for _ in texts]

    def embed_query(self, text: str) -> list[float]:
        # Return dummy vector for query
        return [0.0] * self.dimension

def get_embeddings_model():
    # GoogleGenerativeAIEmbeddings looks for GOOGLE_API_KEY
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        print("WARNING: GEMINI_API_KEY/GOOGLE_API_KEY not found in environment. Using MockEmbeddings (dimension 768).")
        return MockEmbeddings(dimension=768)
        
    if not os.getenv("GOOGLE_API_KEY"):
        os.environ["GOOGLE_API_KEY"] = api_key
        
    try:
        return GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004",
            google_api_key=api_key
        )
    except Exception as e:
        print(f"Error initializing GoogleGenerativeAIEmbeddings: {e}. Falling back to MockEmbeddings.")
        return MockEmbeddings(dimension=768)
