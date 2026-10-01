from services.extraction import extract_document
from services.chunking import chunk_text

file_path = "uploads/207c5f63-28d8-42c9-a3e4-ef0036e106fe.docx"

pages = extract_document(file_path=file_path, file_type=".pdf")

text = pages[1]

chunks = chunk_text(
    text,
    chunk_size=500,
    overlap=100
)

for index, chunk in enumerate(chunks):
    print(f"\n--- CHUNK {index} ---")
    print(chunk)