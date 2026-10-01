from sqlalchemy import (Column, Integer, ForeignKey, UniqueConstraint)
from sqlalchemy.orm import relationship

from app.config.database import Base

class GroupDocument(Base):
    __tablename__ = "group_documents"

    id = Column(
        Integer,
        primary_key=True
    )

    group_id = Column(
        Integer,
        ForeignKey("document_groups.id"),
        nullable=False
    )

    document_id = Column(
        Integer,
        ForeignKey("documents.id"),
        nullable=False
    )

    group = relationship(
        "DocumentGroup",
        back_populates="group_documents"
    )

    document = relationship(
        "Document",
        back_populates="group_documents"
    )

    __table_args__ = (
        UniqueConstraint(
            "group_id",
            "document_id"
        ),
    )