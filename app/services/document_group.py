from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.document_group import DocumentGroup
from app.models.group_document import GroupDocument
from app.models.document import Document

def create_group(db: Session, user_id: int, name: str):
    group = DocumentGroup(
        user_id=user_id,
        name=name
    )

    db.add(group)
    db.commit()
    db.refresh(group)

    return group

def get_user_groups(db: Session, user_id: int):
    return db.query(DocumentGroup).filter(
        DocumentGroup.user_id == user_id
    ).all()

def get_group(db: Session, user_id: int, group_id: int):
    group = db.query(DocumentGroup).filter(
        DocumentGroup.id == group_id,
        DocumentGroup.user_id == user_id
    ).first()

    if group is None:
        raise HTTPException(
            status_code=404,
            detail="Document group not found"
        )

    return group

def update_group(db: Session, user_id: int, group_id: int, name: str):
    group = db.query(DocumentGroup).filter(
        DocumentGroup.id == group_id,
        DocumentGroup.user_id == user_id
    ).first()

    if group is None:
        raise HTTPException(
            status_code=404,
            detail="Document group not found"
        )

    group.name = name

    db.commit()
    db.refresh(group)

    return group

def delete_group(db: Session, user_id: int, group_id: int):
    group = db.query(DocumentGroup).filter(
        DocumentGroup.id == group_id,
        DocumentGroup.user_id == user_id
    ).first()

    if group is None:
        raise HTTPException(
            status_code=404,
            detail="Document group not found"
        )

    db.delete(group)
    db.commit()

    return { "message": "Document group deleted successfully" }


def add_document_to_group(db: Session, user_id: int, group_id: int, document_id: int):
    group = db.query(DocumentGroup).filter(
        DocumentGroup.id == group_id,
        DocumentGroup.user_id == user_id
    ).first()

    if group is None:
        raise HTTPException(
            status_code=404,
            detail="Document group not found"
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

    existing = db.query(GroupDocument).filter(
        GroupDocument.group_id == group_id,
        GroupDocument.document_id == document_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Document already belongs to this group"
        )

    group_document = GroupDocument(
        group_id=group_id,
        document_id=document_id
    )

    db.add(group_document)
    db.commit()
    db.refresh(group_document)

    return group_document

def get_group_documents(db: Session, user_id: int, group_id: int):
    group = db.query(DocumentGroup).filter(
        DocumentGroup.id == group_id,
        DocumentGroup.user_id == user_id
    ).first()

    if group is None:
        raise HTTPException(
            status_code=404,
            detail="Document group not found"
        )

    return db.query(Document).join(
        GroupDocument,
        GroupDocument.document_id == Document.id
    ).filter(
        GroupDocument.group_id == group_id
    ).all()


def remove_document_from_group(db: Session, user_id: int, group_id: int, document_id: int):
    group = db.query(DocumentGroup).filter(
        DocumentGroup.id == group_id,
        DocumentGroup.user_id == user_id
    ).first()

    if group is None:
        raise HTTPException(
            status_code=404,
            detail="Document group not found"
        )

    group_document = db.query(GroupDocument).filter(
        GroupDocument.group_id == group_id,
        GroupDocument.document_id == document_id
    ).first()

    if group_document is None:
        raise HTTPException(
            status_code=404,
            detail="Document is not in this group"
        )

    db.delete(group_document)
    db.commit()

    return { "message": "Document removed from group successfully" }