from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.schemas.message import (MessageCreate, MessageResponse)
from app.services.message import (get_chat_messages, process_user_message)
from app.dependencies.auth import get_current_user

router = APIRouter(
    prefix="/chats",
    tags=["Messages"]
)

# @router.post("/{chat_id}/messages", response_model=MessageResponse)
# def create_chat_message(chat_id: int, data: MessageCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
#     return create_message(db=db, user_id=current_user.id, chat_id=chat_id, role="user", content=data.content)

@router.post("/{chat_id}/messages")
def create_chat_message(chat_id: int, data: MessageCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return process_user_message(db=db, user_id=current_user.id, chat_id=chat_id, content=data.content)

@router.get("/{chat_id}/messages", response_model=list[MessageResponse])
def get_messages(chat_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return get_chat_messages(db=db, user_id=current_user.id, chat_id=chat_id)