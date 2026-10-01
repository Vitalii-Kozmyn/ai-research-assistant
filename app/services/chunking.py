def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200):
    if chunk_size <= overlap:
        raise ValueError("chunk_size must be greater than overlap")

    paragraphs = [
        paragraph.strip()
        for paragraph in text.split("\n")
        if paragraph.strip()
    ]

    chunks = []
    current_chunk = ""

    for paragraph in paragraphs:
        if len(current_chunk) + len(paragraph) + 1 <= chunk_size:
            current_chunk += paragraph + "\n"
        else:
            chunks.append(current_chunk.strip())

            overlap_text = current_chunk[-overlap:]

            current_chunk = overlap_text + paragraph + "\n"

    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    return chunks

def chunk_pages(pages: list[dict], chunk_size: int = 1000, overlap: int = 200):
    if chunk_size <= overlap:
        raise ValueError("chunk_size must be greater than overlap")

    chunks = []

    for page in pages:
        page_number = page["page"]
        text = page["text"]

        paragraphs = [
            paragraph.strip()
            for paragraph in text.split("\n")
            if paragraph.strip()
        ]

        current_chunk = ""

        for paragraph in paragraphs:
            if len(current_chunk) + len(paragraph) + 1 <= chunk_size:
                current_chunk += paragraph + "\n"

            else:
                if current_chunk.strip():
                    chunks.append({
                        "text": current_chunk.strip(),
                        "page": page_number
                    })

                overlap_text = current_chunk[-overlap:]

                current_chunk = overlap_text + paragraph + "\n"

        if current_chunk.strip():
            chunks.append({
                "text": current_chunk.strip(),
                "page": page_number
            })

    return chunks