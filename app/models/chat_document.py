from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.config.database import Base

class ChatDocument(Base):
    __tablename__ = "chat_documents"

    id = Column(Integer, primary_key=True)

    chat_id = Column(
        Integer,
        ForeignKey("chats.id"),
        nullable=False
    )

    document_id = Column(
        Integer,
        ForeignKey("documents.id"),
        nullable=False
    )

    chat = relationship(
        "Chat",
        back_populates="chat_documents"
    )

    document = relationship(
        "Document",
        back_populates="chat_documents"
    )

    __table_args__ = (
        UniqueConstraint(
            "chat_id",
            "document_id"
        ),
    )