import os
import shutil
import uuid
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from app.utils import get_pdf_page_count, get_docx_page_count
from app.models.document import Document

from app.services.extraction import extract_document
from app.services.chunking import chunk_pages
from app.services.embedding import create_embeddings
from app.services.vector_store import add_document_chunks, delete_document_chunks

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
ALLOWED_EXTENSIONS = {".pdf", ".docx"}

def upload_document(db: Session, user_id: int, file: UploadFile):
    document_id = None

    file_ext = os.path.splitext(file.filename)[1].lower()

    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Invalid file format."
        )

    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(
        UPLOAD_DIR,
        unique_filename
    )

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_size = os.path.getsize(file_path)

        page_count = None

        if file_ext == ".pdf":
            page_count = get_pdf_page_count(file_path)

        elif file_ext == ".docx":
            page_count = get_docx_page_count(file_path)

        document = Document(
            user_id=user_id,
            filename=file.filename,
            file_path=file_path,
            file_type=file_ext,
            file_size=file_size,
            page_count=page_count,
            status="processing"
        )

        db.add(document)
        db.commit()
        db.refresh(document)

        document_id = document.id

        pages = extract_document(
            file_path,
            file_ext
        )

        chunks = chunk_pages(pages)

        if not chunks:
            raise ValueError("No text could be extracted from document")

        chunk_texts = [
            chunk["text"]
            for chunk in chunks
        ]

        embeddings = create_embeddings(chunk_texts)

        chunk_pages_list = [
            chunk["page"]
            for chunk in chunks
        ]

        add_document_chunks(
            document_id=document.id,
            filename=document.filename,
            chunks=chunk_texts,
            embeddings=embeddings,
            pages=chunk_pages_list
        )

        document.status = "processed"

        db.commit()
        db.refresh(document)

        return document

    except Exception as error:
        db.rollback()

        if document_id is not None:
            failed_document = db.query(Document).filter(
                Document.id == document_id
            ).first()

            if failed_document:
                failed_document.status = "failed"
                db.commit()

        raise HTTPException(
            status_code=500,
            detail=f"Document processing failed: {str(error)}"
        )

    finally:
        file.file.close()

def get_user_documents(db: Session, user_id: int):
    return db.query(Document).filter(
        Document.user_id == user_id
    ).all()

def get_document(db: Session, document_id: int, user_id: int):
    return db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == user_id
    ).first()

def delete_document(db: Session, document_id: int, user_id: int):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == user_id
    ).first()

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    try:
        if os.path.exists(document.file_path):
            os.remove(document.file_path)

        delete_document_chunks(document.id)

        db.delete(document)
        db.commit()

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Error deleting document"
        )

    return { "message": "Document deleted successfully" }