from app.schemas.document import DocumentResponse
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.services.documents import upload_document, get_user_documents, get_document, delete_document
from app.dependencies.auth import get_current_user


router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


@router.post("/upload", response_model=DocumentResponse)
def upload(file: UploadFile = File(...), db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    document = upload_document(db=db, user_id=current_user.id, file=file)

    return document

@router.get("", response_model=list[DocumentResponse])
def get_documents(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    documents = get_user_documents(db=db, user_id=current_user.id)

    return documents

@router.get("/{document_id}", response_model=DocumentResponse)
def get_document_by_id(document_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    document = get_document(db=db, document_id = document_id, user_id=current_user.id)

    return document

@router.delete("/{document_id}")
def delete(document_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return delete_document(db=db, document_id=document_id, user_id=current_user.id)