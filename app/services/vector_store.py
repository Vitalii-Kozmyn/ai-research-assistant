import chromadb

client = chromadb.PersistentClient(path="./chroma_db")


collection = client.get_or_create_collection(name="documents")


def add_document_chunks(document_id, filename, chunks, embeddings, pages):
    if not (len(chunks) == len(embeddings) == len(pages)):
        raise ValueError("Chunks, embeddings and pages must have the same length")
    
    ids = [
        f"{document_id}_{index}"
        for index in range(len(chunks))
    ]

    metadatas = [
        {
            "document_id": document_id,
            "filename": filename,
            "page": pages[index]
        }
        for index in range(len(chunks))
    ]

    collection.add(
        ids=ids,
        documents=chunks,
        embeddings=embeddings.tolist(),
        metadatas=metadatas
    )


def search_chunks(query_embedding, document_ids, n_results=5):
    results = collection.query(
        query_embeddings=query_embedding.tolist(),
        n_results=n_results,
        where={
            "document_id": {
                "$in": document_ids
            }
        }
    )

    return results


def delete_document_chunks(document_id):
    collection.delete(
        where={
            "document_id": document_id
        }
    )