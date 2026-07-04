import os
import sys
from dotenv import load_dotenv

# Ensure app is importable when run directly
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

load_dotenv()

from app.rag.loader import MedicalDocumentLoader
from app.rag.splitter import MedicalTextSplitter
from app.rag.vector_store import get_vector_store

def run_ingestion():
    print("Starting medical knowledge ingestion process...")
    
    # 1. Setup paths
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    knowledge_dir = os.path.join(base_dir, "knowledge")
    
    print(f"Loading files from: {knowledge_dir}")
    
    # 2. Load documents
    loader = MedicalDocumentLoader(knowledge_dir)
    docs = loader.load()
    if not docs:
        print("No documents found to ingest. Exiting.")
        return
        
    print(f"Loaded {len(docs)} documents successfully.")
    
    # 3. Split documents
    splitter = MedicalTextSplitter(chunk_size=800, chunk_overlap=100)
    chunks = splitter.split_documents(docs)
    print(f"Split documents into {len(chunks)} chunks.")
    
    # 4. Ingest into PGVector
    print("Connecting to vector store and embedding chunks...")
    try:
        vector_store = get_vector_store()
        vector_store.add_documents(chunks)
        print("Successfully ingested medical knowledge into database!")
    except Exception as e:
        print(f"Ingestion failed: {e}")

if __name__ == "__main__":
    run_ingestion()
