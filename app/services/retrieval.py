from app.services.embedding import create_embeddings
from app.services.vector_store import search_chunks


def retrieve_relevant_chunks(question: str, document_ids: list[int], n_results: int = 5):
    question_embedding = create_embeddings([question])

    results = search_chunks(
        query_embedding=question_embedding,
        document_ids=document_ids,
        n_results=n_results
    )

    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]

    retrieved_chunks = []

    for index in range(len(documents)):
        retrieved_chunks.append({
            "text": documents[index],
            "document_id": metadatas[index]["document_id"],
            "filename": metadatas[index]["filename"],
            "page": metadatas[index]["page"],
            "distance": distances[index]
        })

    return retrieved_chunks

def build_context(retrieved_chunks):
    context_parts = []

    for chunk in retrieved_chunks:
        context_parts.append(
            f"""
Source: {chunk["filename"]}
Page: {chunk["page"]}

{chunk["text"]}
"""
        )

    return "\n\n".join(context_parts)