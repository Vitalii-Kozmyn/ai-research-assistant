from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.schemas.chat import (
    ChatCreate,
    ChatUpdate,
    ChatResponse,
    ChatDocumentCreate
)
from app.services.chats import (
    create_chat,
    update_chat,
    get_user_chats,
    get_chat,
    delete_chat,
    get_chat_documents,
    add_document_to_chat,
    remove_document_from_chat
)
from app.dependencies.auth import get_current_user

router = APIRouter(
    prefix="/chats",
    tags=["Chats"]
)

@router.post("", response_model=ChatResponse)
def create_new_chat(data: ChatCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return create_chat(db=db, user_id=current_user.id, document_ids=data.document_ids)

@router.get("", response_model=list[ChatResponse])
def get_chats(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return get_user_chats(db=db, user_id=current_user.id)

@router.get("/{chat_id}", response_model=ChatResponse)
def get_single_chat(chat_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return get_chat(db=db, user_id=current_user.id, chat_id=chat_id)

@router.put("/{chat_id}", response_model=ChatResponse)
def update_chat_title(chat_id: int, data: ChatUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return update_chat(db=db, user_id=current_user.id, chat_id=chat_id, title=data.title)

@router.delete("/{chat_id}")
def delete_single_chat(chat_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return delete_chat(db=db, user_id=current_user.id, chat_id=chat_id)

@router.get("/{chat_id}/documents")
def get_documents(chat_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return get_chat_documents(db=db, user_id=current_user.id, chat_id=chat_id)

@router.post("/{chat_id}/documents")
def add_document(chat_id: int, data: ChatDocumentCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return add_document_to_chat(db=db, user_id=current_user.id, chat_id=chat_id, document_id=data.document_id)

@router.delete("/{chat_id}/documents/{document_id}")
def remove_document(chat_id: int, document_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return remove_document_from_chat(db=db, user_id=current_user.id, chat_id=chat_id, document_id=document_id)