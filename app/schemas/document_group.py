from datetime import datetime
from pydantic import BaseModel

class DocumentGroupCreate(BaseModel):
    name: str

class DocumentGroupUpdate(BaseModel):
    name: str

class DocumentGroupResponse(BaseModel):
    id: int
    name: str
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True

class GroupDocumentCreate(BaseModel):
    document_id: int