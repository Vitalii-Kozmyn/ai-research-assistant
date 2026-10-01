from services.embedding import create_embeddings
from services.vector_store import add_chunks, search_chunks


chunks = [
    "Python is a popular programming language.",
    "Neural networks are used for machine learning.",
    "Transformers are widely used in natural language processing."
]


pages = [1, 2, 5]


embeddings = create_embeddings(chunks)


add_chunks(
    chunks=chunks,
    embeddings=embeddings,
    document_id=1,
    filename="research.pdf",
    pages=pages
)


question = "How are neural networks used?"


question_embedding = create_embeddings([question])


results = search_chunks(
    query_embedding=question_embedding,
    n_results=2
)


print(results)