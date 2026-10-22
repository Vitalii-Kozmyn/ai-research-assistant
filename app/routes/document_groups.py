from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.schemas.document import DocumentResponse
from app.schemas.document_group import (
    DocumentGroupCreate,
    DocumentGroupUpdate,
    DocumentGroupResponse,
    GroupDocumentCreate
)
from app.services.document_group import (
    create_group,
    get_user_groups,
    get_group,
    update_group,
    delete_group,
    add_document_to_group,
    get_group_documents,
    remove_document_from_group
)
from app.dependencies.auth import get_current_user

router = APIRouter(
    prefix="/document-groups",
    tags=["Document Groups"]
)

@router.post("", response_model=DocumentGroupResponse)
def create_document_group(data: DocumentGroupCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return create_group(db=db, user_id=current_user.id, name=data.name)

@router.get("", response_model=list[DocumentGroupResponse])
def get_document_groups(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return get_user_groups(db=db, user_id=current_user.id)

@router.get("/{group_id}", response_model=DocumentGroupResponse
)
def get_document_group(group_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return get_group(db=db, user_id=current_user.id, group_id=group_id)

@router.put("/{group_id}", response_model=DocumentGroupResponse)
def update_document_group(group_id: int, data: DocumentGroupUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return update_group( db=db, user_id=current_user.id, group_id=group_id, name=data.name)

@router.delete("/{group_id}")
def delete_document_group(group_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return delete_group( db=db, user_id=current_user.id, group_id=group_id)

@router.post("/{group_id}/documents")
def add_group_document(group_id: int, data: GroupDocumentCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return add_document_to_group(db=db, user_id=current_user.id, group_id=group_id, document_id=data.document_id)

@router.get("/{group_id}/documents", response_model=list[DocumentResponse])
def get_documents_from_group(group_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return get_group_documents(db=db, user_id=current_user.id, group_id=group_id)

@router.delete("/{group_id}/documents/{document_id}")
def remove_group_document(group_id: int, document_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return remove_document_from_group(db=db, user_id=current_user.id, group_id=group_id, document_id=document_id)