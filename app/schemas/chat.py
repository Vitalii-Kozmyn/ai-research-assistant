from datetime import datetime
from pydantic import BaseModel

class ChatCreate(BaseModel):
    document_ids: list[int]

class ChatUpdate(BaseModel):
    title: str

class ChatResponse(BaseModel):
    id: int
    title: str | None
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True

class ChatDocumentCreate(BaseModel):
    document_id: int