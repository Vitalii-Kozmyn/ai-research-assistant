from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.config.database import Base

class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    title = Column(
        String,
        nullable=True
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )
    
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now()
    )

    messages = relationship(
        "Message",
        back_populates="chat",
        cascade="all, delete-orphan"
    )

    chat_documents = relationship(
        "ChatDocument",
        back_populates="chat",
        cascade="all, delete-orphan"
    )