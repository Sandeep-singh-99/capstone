import os
from dotenv import load_dotenv
from langchain_community.vectorstores import PGVector
from app.rag.embeddings import get_embeddings_model

load_dotenv()

def get_connection_string() -> str:
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise ValueError("DATABASE_URL is not set in environment.")
    
    # Strip any potential literal quotes from .env loading
    if db_url.startswith("'") and db_url.endswith("'"):
        db_url = db_url[1:-1]
    if db_url.startswith('"') and db_url.endswith('"'):
        db_url = db_url[1:-1]
    return db_url

def get_vector_store(collection_name: str = "medical_knowledge") -> PGVector:
    embeddings = get_embeddings_model()
    connection_string = get_connection_string()
    
    return PGVector(
        connection_string=connection_string,
        embedding_function=embeddings,
        collection_name=collection_name
    )
