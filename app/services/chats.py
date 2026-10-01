from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.chat import Chat
from app.models.chat_document import ChatDocument
from app.models.document import Document

def create_chat(db: Session, user_id: int, document_ids: list[int]):
    documents = db.query(Document).filter(
        Document.id.in_(document_ids),
        Document.user_id == user_id
    ).all()

    if len(documents) != len(set(document_ids)):
        raise HTTPException(
            status_code=404,
            detail="One or more documents not found"
        )

    chat = Chat(
        user_id=user_id
    )

    db.add(chat)
    db.flush()

    for document_id in document_ids:
        chat_document = ChatDocument(
            chat_id=chat.id,
            document_id=document_id
        )

        db.add(chat_document)

    db.commit()
    db.refresh(chat)

    return chat

def update_chat(db: Session, user_id: int, chat_id: int, title: str):
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == user_id
    ).first()

    if chat is None:
        raise HTTPException(
            status_code=404,
            detail="Chat not found"
        )

    chat.title = title

    db.commit()
    db.refresh(chat)

    return chat

def get_user_chats(db: Session, user_id: int):
    return db.query(Chat).filter(
        Chat.user_id == user_id
    ).all()

def get_chat(db: Session, user_id: int, chat_id: int):
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == user_id
    ).first()

    if chat is None:
        raise HTTPException(
            status_code=404,
            detail="Chat not found"
        )

    return chat

def delete_chat(db: Session, user_id: int, chat_id: int):
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == user_id
    ).first()

    if chat is None:
        raise HTTPException(
            status_code=404,
            detail="Chat not found"
        )

    db.delete(chat)
    db.commit()

    return { "message": "Chat deleted successfully" }

def get_chat_documents(db: Session, user_id: int, chat_id: int):
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == user_id
    ).first()

    if chat is None:
        raise HTTPException(
            status_code=404,
            detail="Chat not found"
        )

    return db.query(Document).join(
        ChatDocument,
        ChatDocument.document_id == Document.id
    ).filter(
        ChatDocument.chat_id == chat_id
    ).all()

def add_document_to_chat(db: Session, user_id: int, chat_id: int, document_id: int):
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == user_id
    ).first()

    if chat is None:
        raise HTTPException(
            status_code=404,
            detail="Chat not found"
        )

    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == user_id
    ).first()

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    existing = db.query(ChatDocument).filter(
        ChatDocument.chat_id == chat_id,
        ChatDocument.document_id == document_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Document already belongs to this chat"
        )

    chat_document = ChatDocument(
        chat_id=chat_id,
        document_id=document_id
    )

    db.add(chat_document)
    db.commit()
    db.refresh(chat_document)

    return chat_document

def remove_document_from_chat(db: Session, user_id: int, chat_id: int, document_id: int):
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == user_id
    ).first()

    if chat is None:
        raise HTTPException(
            status_code=404,
            detail="Chat not found"
        )

    chat_document = db.query(ChatDocument).filter(
        ChatDocument.chat_id == chat_id,
        ChatDocument.document_id == document_id
    ).first()

    if chat_document is None:
        raise HTTPException(
            status_code=404,
            detail="Document is not in this chat"
        )

    db.delete(chat_document)
    db.commit()

    return { "message": "Document removed from chat successfully" }   

def get_chat_document_ids(db: Session, user_id: int, chat_id: int):
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == user_id
    ).first()

    if chat is None:
        raise HTTPException(
            status_code=404,
            detail="Chat not found"
        )

    documents = db.query(Document).join(
        ChatDocument,
        ChatDocument.document_id == Document.id
    ).filter(
        ChatDocument.chat_id == chat_id
    ).all()

    return [document.id for document in documents]    

def get_chat(db: Session, user_id: int, chat_id: int):
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == user_id
    ).first()

    if chat is None:
        raise HTTPException(
            status_code=404,
            detail="Chat not found"
        )

    return chat     

def build_chat_history(messages):
    history = []

    for message in messages:
        history.append(
            f"{message.role.capitalize()}: {message.content}"
        )

    return "\n".join(history)