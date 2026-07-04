import os
from typing import List
from langchain_core.documents import Document

class MedicalDocumentLoader:
    def __init__(self, directory_path: str):
        self.directory_path = directory_path

    def load(self) -> List[Document]:
        documents = []
        if not os.path.exists(self.directory_path):
            print(f"Directory {self.directory_path} does not exist.")
            return documents
        
        for filename in os.listdir(self.directory_path):
            if filename.endswith(".md") or filename.endswith(".txt"):
                file_path = os.path.join(self.directory_path, filename)
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        text = f.read()
                        doc = Document(
                            page_content=text,
                            metadata={"source": filename, "path": file_path}
                        )
                        documents.append(doc)
                except Exception as e:
                    print(f"Error loading {file_path}: {e}")
        return documents
