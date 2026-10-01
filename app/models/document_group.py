from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.config.database import Base

class DocumentGroup(Base):
    __tablename__ = "document_groups"

    id = Column(
        Integer,
        primary_key=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    name = Column(
        String,
        nullable=False
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

    group_documents = relationship(
        "GroupDocument",
        back_populates="group",
        cascade="all, delete-orphan"
    )