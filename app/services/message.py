from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.message import Message
from app.models.chat import Chat

from app.services.chats import build_chat_history, get_chat, get_chat_document_ids
from app.services.retrieval import retrieve_relevant_chunks, build_context
from app.services.llm import generate_answer
from app.services.llm import generate_chat_title
from app.services.chats import update_chat

def create_message(db: Session, user_id: int, chat_id: int, role: str, content: str):
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == user_id
    ).first()

    if chat is None:
        raise HTTPException(
            status_code=404,
            detail="Chat not found"
        )

    if role not in ["user", "assistant"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid message role"
        )

    message = Message(
        chat_id=chat_id,
        role=role,
        content=content
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return message

def get_chat_messages(db: Session, user_id: int, chat_id: int):
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == user_id
    ).first()

    if chat is None:
        raise HTTPException(
            status_code=404,
            detail="Chat not found"
        )

    messages = db.query(Message).filter(
        Message.chat_id == chat_id
    ).order_by(
        Message.created_at.desc()
    ).limit(10).all()

    messages.reverse()

    return messages

def process_user_message(db: Session, user_id: int, chat_id: int, content: str):
    previous_messages = get_chat_messages(
        db=db,
        user_id=user_id,
        chat_id=chat_id
    )
    
    history = build_chat_history(
        previous_messages
    )
    
    message = create_message(
        db=db,
        user_id=user_id,
        chat_id=chat_id,
        role="user",
        content=content
    )

    chat = get_chat(
        db=db,
        user_id=user_id,
        chat_id=chat_id
    )

    document_ids = get_chat_document_ids(
        db=db,
        user_id=user_id,
        chat_id=chat_id
    )

    if not document_ids:
        raise HTTPException(
            status_code=400,
            detail="Chat has no documents"
        )

    retrieved_chunks = retrieve_relevant_chunks(
        question=content,
        document_ids=document_ids,
        n_results=5
    )

    context = build_context(
        retrieved_chunks
    )

    answer = generate_answer(
        question=content,
        context=context,
        history=history
    )
    
    assistant_message = create_message(
        db=db,
        user_id=user_id,
        chat_id=chat_id,
        role="assistant",
        content=answer
    )

    if chat.title is None:
        title = generate_chat_title(
            question=content
        )

        update_chat(
            db=db,
            user_id=user_id,
            chat_id=chat_id,
            title=title
        )

    return {
        "answer": answer,
        "sources": [
            {
                "document": chunk["filename"],
                "page": chunk["page"]
            }
            for chunk in retrieved_chunks
        ]
    }