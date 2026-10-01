from docx import Document
import fitz


def extract_text_from_pdf(file_path: str):
    document = fitz.open(file_path)

    pages = []

    for page_number, page in enumerate(document, start=1):
        text = page.get_text()

        pages.append({
            "page": page_number,
            "text": text
        })

    document.close()

    return pages


def extract_text_from_docx(file_path: str):
    document = Document(file_path)

    text = []

    for paragraph in document.paragraphs:
        if paragraph.text.strip():
            text.append(paragraph.text.strip())

    return [
        {
            "page": 1,
            "text": "\n".join(text)
        }
    ]


def extract_document(file_path: str, file_type: str):
    if file_type == ".pdf":
        return extract_text_from_pdf(file_path)

    if file_type == ".docx":
        return extract_text_from_docx(file_path)

    raise ValueError(f"Unsupported file type: {file_type}")