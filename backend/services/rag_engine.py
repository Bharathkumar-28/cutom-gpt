# services/rag_engine.py

import os
import chromadb
from chromadb.utils import embedding_functions
from PyPDF2 import PdfReader

PDF_FOLDER = r"C:\Users\Bharath\OneDrive\Desktop\cutom gpt2\backend\researchpapers"

client = chromadb.PersistentClient(path="vector_store")

embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

collection = client.get_or_create_collection(
    name="metal_knowledge",
    embedding_function=embedding_function
)


def ingest_pdfs():
    for file in os.listdir(PDF_FOLDER):
        if file.lower().endswith(".pdf"):
            pdf_path = os.path.join(PDF_FOLDER, file)
            reader = PdfReader(pdf_path)

            for page_num, page in enumerate(reader.pages):
                text = page.extract_text()
                if text:
                    doc_id = f"{file}_page_{page_num}"
                    collection.add(
                        documents=[text],
                        ids=[doc_id],
                        metadatas=[{"source": file, "page": page_num + 1}]
                    )


def search_knowledge(query):
    results = collection.query(
        query_texts=[query],
        n_results=5
    )

    if results["documents"]:
        return "\n".join(results["documents"][0])
    return "No research found."


# ✅ Run once to store vectors permanently
ingest_pdfs()
