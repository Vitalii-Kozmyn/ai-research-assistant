from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.config.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    filename = Column(
        String,
        nullable=False
    )

    file_path = Column(
        String,
        nullable=False
    )

    file_type = Column(
        String,
        nullable=False
    )

    file_size = Column(
        Integer,
        nullable=False
    )

    page_count = Column(
        Integer,
        nullable=True
    )

    status = Column(
        String,
        nullable=False,
        default="uploaded"
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

    chat_documents = relationship(
        "ChatDocument",
        back_populates="document"
    )

    group_documents = relationship(
        "GroupDocument",
        back_populates="document"
    )